import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Youdao } from '@opentranslate/youdao'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { YoudaotransLanguage } from './config'

export const getTranslator = memoizeOne(
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

  const appKey = config.dictAuth.youdaotrans.appKey
  const key = config.dictAuth.youdaotrans.key
  const translatorConfig = appKey && key ? { appKey, key } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return machineResult(
      {
        result: {
          id: 'youdaotrans',
          sl: result.from,
          tl: result.to,
          slInitial: profile.dicts.all.youdaotrans.options.slInitial,
          searchText: result.origin,
          trans: result.trans
        },
        audio: {
          py: result.trans.tts,
          us: result.trans.tts
        }
      },
      translator.getSupportLanguages()
    )
  } catch (e) {
    return machineResult(
      {
        result: {
          id: 'youdaotrans',
          sl,
          tl,
          slInitial: 'hide',
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] }
        }
      },
      translator.getSupportLanguages()
    )
  }
}
