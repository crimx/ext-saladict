import {
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  getMTArgs
} from '../helpers'
import memoizeOne from 'memoize-one'
import { Youdao } from '@opentranslate/youdao'
import { YoudaotransLanguage } from './config'

const getTranslator = memoizeOne(
  () =>
    new Youdao({
      env: 'ext',
      config:
        process.env.YOUDAO_APPKEY && process.env.YOUDAO_KEY
          ? {
              appKey: process.env.YOUDAO_APPKEY,
              key: process.env.YOUDAO_KEY
            }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return `http://fanyi.youdao.com`
}

export type YoudaotransResult = MachineTranslateResult<'youdaotrans'>

export const search: SearchFunction<
  YoudaotransResult,
  MachineTranslatePayload<YoudaotransLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.youdaotrans,
    config,
    payload
  )

  const appKey = config.dictAuth.youdaotrans?.appKey
  const key = config.dictAuth.youdaotrans?.key
  const translatorConfig = appKey && key ? { appKey, key } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return {
      result: {
        id: 'youdaotrans',
        sl: result.from,
        tl: result.to,
        langcodes: translator.getSupportLanguages(),
        searchText: result.origin,
        trans: result.trans
      },
      audio: {
        py: result.trans.tts,
        us: result.trans.tts
      }
    }
  } catch (e) {
    return {
      result: {
        id: 'youdaotrans',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
