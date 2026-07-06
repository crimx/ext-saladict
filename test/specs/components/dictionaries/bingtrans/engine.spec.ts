import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  BING_AUTH_ENDPOINT,
  BING_TRANSLATE_ENDPOINT,
  buildBingTranslateParams,
  mapBingLanguage,
  parseBingTranslatedText,
  resetBingAuthToken,
  search
} from '@/components/dictionaries/bingtrans/engine'

describe('Dict/Bingtrans/engine', () => {
  let mock: AxiosMockAdapter | undefined

  afterEach(() => {
    mock?.restore()
    mock = undefined
    resetBingAuthToken()
  })

  function mockAxios(): AxiosMockAdapter {
    mock = new AxiosMockAdapter(axios)
    return mock
  }

  it('maps Saladict language codes to Microsoft Translator codes', () => {
    expect(mapBingLanguage('auto')).toBe('auto')
    expect(mapBingLanguage('zh-CN')).toBe('zh-Hans')
    expect(mapBingLanguage('zh-TW')).toBe('zh-Hant')
    expect(mapBingLanguage('en')).toBe('en')
  })

  it('builds translate query params with auto-detect by default', () => {
    expect(
      buildBingTranslateParams({
        sourceLanguage: 'auto',
        targetLanguage: 'zh-CN'
      })
    ).toBe('api-version=3.0&to=zh-Hans')
    expect(
      buildBingTranslateParams({
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      })
    ).toBe('api-version=3.0&to=zh-Hans&from=en')
  })

  it('parses Microsoft Translator response shape', () => {
    expect(
      parseBingTranslatedText([
        {
          detectedLanguage: { language: 'en' },
          translations: [{ text: '你好', to: 'zh-Hans' }]
        }
      ])
    ).toEqual({
      translatedText: '你好',
      detectedLanguage: 'en'
    })
    expect(parseBingTranslatedText([])).toEqual({
      translatedText: '',
      detectedLanguage: undefined
    })
  })

  it('translates through Bing without credentials', async () => {
    const mock = mockAxios()
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt.token.value')
    let authHeader = ''
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(request => {
      authHeader = request.headers?.Authorization || ''
      return [
        200,
        [
          {
            detectedLanguage: { language: 'en' },
            translations: [{ text: '你好', to: 'zh-Hans' }]
          }
        ]
      ]
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('bingtrans')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])
    expect(authHeader).toBe('Bearer jwt.token.value')
  })

  it('normalizes the detected source language from the response', async () => {
    const mock = mockAxios()
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt.token.value')
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(200, [
      {
        detectedLanguage: { language: 'zh-Hans' },
        translations: [{ text: 'hello', to: 'en' }]
      }
    ])

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('你好', config, profile, {
      isPDF: false,
      tl: 'en'
    })

    expect(result.result.sl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['hello'])
  })

  it('returns an empty result when the translation is missing', async () => {
    const mock = mockAxios()
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt.token.value')
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(200, [])

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('bingtrans')
    expect(result.result.trans.paragraphs).toEqual([''])
  })

  it('returns an empty result when the request fails', async () => {
    const mock = mockAxios()
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt.token.value')
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(500)

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('bingtrans')
    expect(result.result.trans.paragraphs).toEqual([''])
  })

  it('does not cache an invalid auth token response', async () => {
    const mock = mockAxios()
    let authCount = 0
    mock
      .onGet(BING_AUTH_ENDPOINT)
      .reply(() => [
        200,
        authCount++ === 0 ? 'temporary auth failure' : 'fresh.token.value'
      ])
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(200, [
      {
        detectedLanguage: { language: 'en' },
        translations: [{ text: '你好', to: 'zh-Hans' }]
      }
    ])

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const failedResult = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })
    const retriedResult = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(failedResult.result.trans.paragraphs).toEqual([''])
    expect(retriedResult.result.trans.paragraphs).toEqual(['你好'])
    expect(authCount).toBe(2)
  })

  it('refreshes the auth token once when translation rejects it', async () => {
    const mock = mockAxios()
    let authCount = 0
    const authHeaders: string[] = []
    mock
      .onGet(BING_AUTH_ENDPOINT)
      .reply(() => [
        200,
        authCount++ === 0 ? 'stale.token.value' : 'fresh.token.value'
      ])
    mock.onPost(new RegExp(`^${BING_TRANSLATE_ENDPOINT}`)).reply(request => {
      authHeaders.push(request.headers?.Authorization || '')
      return authHeaders.length === 1
        ? [401]
        : [
            200,
            [
              {
                detectedLanguage: { language: 'en' },
                translations: [{ text: '你好', to: 'zh-Hans' }]
              }
            ]
          ]
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.trans.paragraphs).toEqual(['你好'])
    expect(authHeaders).toEqual([
      'Bearer stale.token.value',
      'Bearer fresh.token.value'
    ])
  })
})
