import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  DEEPL_API_ENDPOINT,
  DEEPL_FREE_API_ENDPOINT,
  buildDeepLPayload,
  getDeepLEndpoint,
  mapDeepLLanguage,
  mapDeepLSourceLanguage,
  parseDeepLTranslatedText,
  search
} from '@/components/dictionaries/deepl/engine'

describe('deepl translator', () => {
  it('maps Saladict language codes to DeepL language codes', () => {
    expect(mapDeepLLanguage('auto')).toBe('')
    expect(mapDeepLLanguage('zh-CN')).toBe('ZH-HANS')
    expect(mapDeepLLanguage('zh-TW')).toBe('ZH-HANT')
    expect(mapDeepLLanguage('en')).toBe('EN')
    expect(mapDeepLLanguage('ja')).toBe('JA')
  })

  it('maps source Chinese variants to the DeepL source language code', () => {
    expect(mapDeepLSourceLanguage('auto')).toBe('')
    expect(mapDeepLSourceLanguage('zh-CN')).toBe('ZH')
    expect(mapDeepLSourceLanguage('zh-TW')).toBe('ZH')
    expect(mapDeepLSourceLanguage('en')).toBe('EN')
  })

  it('chooses official DeepL endpoint from the auth key suffix', () => {
    expect(getDeepLEndpoint('abc:fx')).toBe(DEEPL_FREE_API_ENDPOINT)
    expect(getDeepLEndpoint('abc')).toBe(DEEPL_API_ENDPOINT)
  })

  it('builds DeepL form payload', () => {
    expect(
      buildDeepLPayload({
        text: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      })
    ).toEqual({
      text: ['hello'],
      target_lang: 'ZH-HANS',
      source_lang: 'EN'
    })
  })

  it('parses DeepL translation response', () => {
    expect(
      parseDeepLTranslatedText({
        translations: [
          {
            detected_source_language: 'EN',
            text: '你好'
          }
        ]
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'EN' })
  })

  it('requires an auth key before calling DeepL', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('deepl')
  })

  it('translates through official DeepL when the auth key exists', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost(DEEPL_FREE_API_ENDPOINT).reply(200, {
      translations: [
        {
          detected_source_language: 'EN',
          text: '你好'
        }
      ]
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config.dictAuth as any).deepl.authKey = 'test:fx'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('deepl')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
