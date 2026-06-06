import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  ALIBABA_ENDPOINT,
  buildAlibabaSignedUrl,
  mapAlibabaLanguage,
  parseAlibabaTranslatedText,
  search
} from '@/components/dictionaries/alibaba/engine'

describe('Dict/Alibaba/engine', () => {
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

  it('maps Saladict language codes to Alibaba language codes', () => {
    expect(mapAlibabaLanguage('auto')).toBe('auto')
    expect(mapAlibabaLanguage('zh-CN')).toBe('zh')
    expect(mapAlibabaLanguage('zh-TW')).toBe('zh-tw')
    expect(mapAlibabaLanguage('en')).toBe('en')
  })

  it('builds a deterministic signed Aliyun URL', async () => {
    const url = await buildAlibabaSignedUrl(
      {
        accessKeyId: 'testid',
        accessKeySecret: 'testsecret',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      },
      new Date('2026-06-06T00:00:00Z'),
      'nonce'
    )

    expect(url.startsWith(ALIBABA_ENDPOINT + '?')).toBe(true)
    expect(url).toContain('Action=TranslateGeneral')
    expect(url).toContain('AccessKeyId=testid')
    expect(url).toContain('SourceText=hello')
    expect(url).toContain('SourceLanguage=en')
    expect(url).toContain('TargetLanguage=zh')
    expect(url).toContain('Signature=')
  })

  it('parses common Aliyun response shapes', () => {
    expect(
      parseAlibabaTranslatedText({
        Data: {
          Translated: '你好',
          DetectedLanguage: 'en'
        }
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })

    expect(
      parseAlibabaTranslatedText({
        Data: JSON.stringify({
          Translated: '你好',
          DetectedLanguage: 'en'
        })
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })
  })

  it('requires credentials before calling Alibaba', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('alibaba')
  })

  it('translates through Alibaba when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(new RegExp('^https://mt.aliyuncs.com/')).reply(200, {
      Data: {
        Translated: '你好',
        DetectedLanguage: 'en'
      }
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.alibaba.accessKeyId = 'testid'
    ;(config as any).dictAuth.alibaba.accessKeySecret = 'testsecret'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('alibaba')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
