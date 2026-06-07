import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  VOLC_ENDPOINT,
  buildVolcSignedRequest,
  mapVolcLanguage,
  parseVolcTranslatedText,
  search
} from '@/components/dictionaries/volc/engine'

describe('Dict/Volc/engine', () => {
  beforeAll(() => {
    const nodeCrypto = require('crypto')
    const { TextEncoder } = require('util')
    Object.defineProperty(globalThis, 'crypto', {
      value: nodeCrypto.webcrypto,
      configurable: true
    })
    Object.defineProperty(globalThis, 'TextEncoder', {
      value: TextEncoder,
      configurable: true
    })
  })

  it('maps Saladict language codes to Volcengine language codes', () => {
    expect(mapVolcLanguage('auto')).toBe('')
    expect(mapVolcLanguage('zh-CN')).toBe('zh')
    expect(mapVolcLanguage('zh-TW')).toBe('zh-Hant')
    expect(mapVolcLanguage('en')).toBe('en')
  })

  it('builds a signed Volcengine request', async () => {
    const request = await buildVolcSignedRequest(
      {
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      },
      new Date('2026-06-06T00:00:00Z')
    )

    expect(request.url).toBe(
      `${VOLC_ENDPOINT}?Action=TranslateText&Version=2020-06-01`
    )
    expect(request.body).toBe(
      JSON.stringify({
        SourceLanguage: 'en',
        TargetLanguage: 'zh',
        TextList: ['hello']
      })
    )
    expect(request.headers.Authorization).toContain('HMAC-SHA256')
    expect(request.headers.Authorization).toContain('Credential=ak/')
    expect(request.headers.Authorization).toContain('Signature=')
    expect(request.headers['X-Date']).toBe('20260606T000000Z')
  })

  it('omits SourceLanguage when Volcengine source language is auto', async () => {
    const request = await buildVolcSignedRequest(
      {
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
        sourceText: 'hello',
        sourceLanguage: 'auto',
        targetLanguage: 'zh-CN'
      },
      new Date('2026-06-06T00:00:00Z')
    )

    expect(request.body).toBe(
      JSON.stringify({
        TargetLanguage: 'zh',
        TextList: ['hello']
      })
    )
  })

  it('parses common Volcengine response shapes', () => {
    expect(
      parseVolcTranslatedText({
        TranslationList: [
          {
            Translation: '你好',
            DetectedSourceLanguage: 'en'
          }
        ]
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })

    expect(parseVolcTranslatedText({ TranslatedText: '你好' })).toEqual({
      translatedText: '你好',
      detectedLanguage: undefined
    })

    expect(
      parseVolcTranslatedText({
        Result: {
          TranslationList: [
            {
              Translation: '你好',
              DetectedSourceLanguage: 'en'
            }
          ]
        }
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })
  })

  it('requires credentials before calling Volcengine', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('volc')
  })

  it('translates through Volcengine when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    let requestBody = ''
    mock
      .onPost(`${VOLC_ENDPOINT}?Action=TranslateText&Version=2020-06-01`)
      .reply(request => {
        requestBody = request.data
        return [
          200,
          {
            TranslationList: [
              {
                Translation: '你好',
                DetectedSourceLanguage: 'en'
              }
            ]
          }
        ]
      })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.volc.accessKeyId = 'ak'
    ;(config as any).dictAuth.volc.secretAccessKey = 'sk'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('volc')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])
    expect(requestBody).toContain('"SourceLanguage":"en"')

    mock.restore()
  })

  it('uses Volcengine auto source detection by default', async () => {
    const mock = new AxiosMockAdapter(axios)
    let requestBody = ''
    mock
      .onPost(`${VOLC_ENDPOINT}?Action=TranslateText&Version=2020-06-01`)
      .reply(request => {
        requestBody = request.data
        return [
          200,
          {
            TranslationList: [
              {
                Translation: '你好',
                DetectedSourceLanguage: 'en'
              }
            ]
          }
        ]
      })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.volc.accessKeyId = 'ak'
    ;(config as any).dictAuth.volc.secretAccessKey = 'sk'

    await search('hello', config, profile, {
      isPDF: false,
      tl: 'zh-CN'
    })

    expect(requestBody).not.toContain('SourceLanguage')

    mock.restore()
  })
})
