import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  buildDeepLXPayload,
  buildDeepLXUrl,
  mapDeepLXLanguage,
  parseDeepLXTranslatedText,
  search
} from '@/components/dictionaries/deeplx/engine'

describe('deeplx translator', () => {
  it('maps Saladict language codes to DeepLX language codes', () => {
    expect(mapDeepLXLanguage('auto')).toBe('auto')
    expect(mapDeepLXLanguage('zh-CN')).toBe('ZH-HANS')
    expect(mapDeepLXLanguage('zh-TW')).toBe('ZH-HANT')
    expect(mapDeepLXLanguage('en')).toBe('EN')
    expect(mapDeepLXLanguage('ja')).toBe('JA')
  })

  it('normalizes DeepLX translate URLs', () => {
    expect(buildDeepLXUrl('https://example.com')).toBe(
      'https://example.com/translate'
    )
    expect(buildDeepLXUrl('https://example.com/translate')).toBe(
      'https://example.com/translate'
    )
    expect(buildDeepLXUrl('https://example.com/translate?token=secret')).toBe(
      'https://example.com/translate?token=secret'
    )
    expect(buildDeepLXUrl('https://example.com/v1')).toBe(
      'https://example.com/v1/translate'
    )
  })

  it('inserts token placeholders into DeepLX URLs', () => {
    expect(
      buildDeepLXUrl('https://api.deeplx.com/{{apiKey}}/translate', 'secret')
    ).toBe('https://api.deeplx.com/secret/translate')
    expect(
      buildDeepLXUrl(
        'https://api.deeplx.com/v1/translate?token={{apiKey}}',
        'secret'
      )
    ).toBe('https://api.deeplx.com/v1/translate?token=secret')
    expect(
      buildDeepLXUrl('https://{{apiKey}}.api.deeplx.com/translate', 'secret')
    ).toBe('https://secret.api.deeplx.com/translate')
  })

  it('builds DeepLX JSON payload', () => {
    expect(
      buildDeepLXPayload({
        text: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      })
    ).toEqual({
      text: 'hello',
      source_lang: 'EN',
      target_lang: 'ZH-HANS'
    })
  })

  it('parses common DeepLX response shapes', () => {
    expect(
      parseDeepLXTranslatedText({
        code: 200,
        data: '你好',
        source_lang: 'EN'
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'EN' })

    expect(
      parseDeepLXTranslatedText({
        translations: [{ text: '你好', detected_source_language: 'EN' }]
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'EN' })
  })

  it('requires an API URL before calling DeepLX', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('deeplx')
  })

  it('reports invalid DeepLX credentials', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://deeplx.example.com/translate').reply(401, {
      message: 'unauthorized'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl = 'https://deeplx.example.com'
    ;(config.dictAuth as any).deeplx.token = 'bad'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('invalid')

    mock.restore()
  })

  it('reports DeepLX quota errors', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://deeplx.example.com/translate').reply(429, {
      message: 'too many requests'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl = 'https://deeplx.example.com'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('quota')

    mock.restore()
  })

  it('requires a non-empty API URL before calling DeepLX', async () => {
    const mock = new AxiosMockAdapter(axios)
    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl = '   '

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('deeplx')
    expect(mock.history.post).toHaveLength(0)

    mock.restore()
  })

  it('translates through DeepLX when the API URL exists', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://deeplx.example.com/translate').reply(200, {
      code: 200,
      data: '你好',
      source_lang: 'EN'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl = 'https://deeplx.example.com'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('deeplx')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })

  it('sends a token as bearer auth when configured without a placeholder', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://deeplx.example.com/translate').reply(200, {
      code: 200,
      data: '你好',
      source_lang: 'EN'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl = 'https://deeplx.example.com'
    ;(config.dictAuth as any).deeplx.token = 'secret'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.trans.paragraphs).toEqual(['你好'])
    expect(mock.history.post[0].headers?.Authorization).toBe('Bearer secret')

    mock.restore()
  })

  it('does not send bearer auth when the token is inserted into the URL', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://deeplx.example.com/secret/translate').reply(200, {
      code: 200,
      data: '你好',
      source_lang: 'EN'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deeplx.apiUrl =
      'https://deeplx.example.com/{{apiKey}}/translate'
    ;(config.dictAuth as any).deeplx.token = 'secret'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.trans.paragraphs).toEqual(['你好'])
    expect(mock.history.post[0].headers?.Authorization).toBeUndefined()

    mock.restore()
  })
})
