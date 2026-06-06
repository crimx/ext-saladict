import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  NIUTRANS_ENDPOINT,
  buildNiuTransPayload,
  mapNiuTransLanguage,
  parseNiuTransTranslatedText,
  search
} from '@/components/dictionaries/niutrans/engine'

describe('Dict/NiuTrans/engine', () => {
  it('maps Saladict language codes to NiuTrans language codes', () => {
    expect(mapNiuTransLanguage('auto')).toBe('auto')
    expect(mapNiuTransLanguage('zh-CN')).toBe('zh')
    expect(mapNiuTransLanguage('zh-TW')).toBe('cht')
    expect(mapNiuTransLanguage('en')).toBe('en')
  })

  it('builds NiuTrans form payload', () => {
    expect(
      buildNiuTransPayload({
        apikey: 'key',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      })
    ).toBe('from=en&to=zh&apikey=key&src_text=hello')
  })

  it('parses common NiuTrans response shapes', () => {
    expect(parseNiuTransTranslatedText({ tgt_text: '你好', from: 'en' })).toEqual({
      translatedText: '你好',
      detectedLanguage: 'en'
    })
    expect(parseNiuTransTranslatedText({ tgtText: '你好' })).toEqual({
      translatedText: '你好',
      detectedLanguage: undefined
    })
  })

  it('requires credentials before calling NiuTrans', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('niutrans')
  })

  it('translates through NiuTrans when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost(NIUTRANS_ENDPOINT).reply(200, {
      tgt_text: '你好',
      from: 'en'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.niutrans.apikey = 'key'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('niutrans')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
