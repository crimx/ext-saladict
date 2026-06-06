import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  BAIDU_ENDPOINT,
  buildBaiduParams,
  mapBaiduLanguage,
  parseBaiduTranslatedText,
  search
} from '@/components/dictionaries/baidu/engine'

describe('Dict/Baidu/engine', () => {
  it('maps Saladict language codes to Baidu language codes', () => {
    expect(mapBaiduLanguage('auto')).toBe('auto')
    expect(mapBaiduLanguage('zh-CN')).toBe('zh')
    expect(mapBaiduLanguage('zh-TW')).toBe('cht')
    expect(mapBaiduLanguage('ja')).toBe('jp')
    expect(mapBaiduLanguage('ko')).toBe('kor')
    expect(mapBaiduLanguage('en')).toBe('en')
  })

  it('builds signed Baidu params', () => {
    const params = buildBaiduParams({
      appid: 'appid',
      key: 'key',
      sourceText: 'hello',
      sourceLanguage: 'en',
      targetLanguage: 'zh-CN',
      salt: '123'
    })

    expect(params).toEqual({
      q: 'hello',
      from: 'en',
      to: 'zh',
      appid: 'appid',
      salt: '123',
      sign: 'ee5464a269ed944ffef7569e277346ef'
    })
  })

  it('parses Baidu translation results', () => {
    expect(
      parseBaiduTranslatedText({
        from: 'en',
        trans_result: [{ src: 'hello', dst: '你好' }]
      })
    ).toEqual({
      translatedText: '你好',
      sourceText: 'hello',
      detectedLanguage: 'en'
    })
  })

  it('requires credentials before calling Baidu', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('baidu')
  })

  it('uses configured Baidu appid and key when translating', async () => {
    const mock = new AxiosMockAdapter(axios)
    let params: any

    mock.onGet(BAIDU_ENDPOINT).reply(request => {
      params = request.params
      return [
        200,
        {
          from: 'en',
          to: 'zh',
          trans_result: [{ src: 'hello', dst: '你好' }]
        }
      ]
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.baidu.appid = ' appid '
    ;(config as any).dictAuth.baidu.key = ' key '

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(params.appid).toBe('appid')
    expect(params.from).toBe('en')
    expect(params.to).toBe('zh')
    expect(params.sign).toEqual(expect.any(String))
    expect(result.result.id).toBe('baidu')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })

  it('uses Baidu auto-detection when source language is not specified', async () => {
    const mock = new AxiosMockAdapter(axios)
    let params: any

    mock.onGet(BAIDU_ENDPOINT).reply(request => {
      params = request.params
      return [
        200,
        {
          from: 'en',
          to: 'zh',
          trans_result: [{ src: 'hello', dst: '你好' }]
        }
      ]
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.baidu.appid = 'appid'
    ;(config as any).dictAuth.baidu.key = 'key'

    await search('hello', config, profile, {
      isPDF: false,
      tl: 'zh-CN'
    })

    expect(params.from).toBe('auto')

    mock.restore()
  })
})
