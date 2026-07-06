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
  afterEach(() => {
    resetBingAuthToken()
  })

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
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt-token')
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
    expect(authHeader).toBe('Bearer jwt-token')

    mock.restore()
  })

  it('normalizes the detected source language from the response', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt-token')
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

    mock.restore()
  })

  it('returns an empty result when the translation is missing', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt-token')
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

    mock.restore()
  })

  it('returns an empty result when the request fails', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(BING_AUTH_ENDPOINT).reply(200, 'jwt-token')
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

    mock.restore()
  })
})
