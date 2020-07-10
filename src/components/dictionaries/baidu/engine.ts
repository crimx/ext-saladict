import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Baidu } from '@opentranslate/baidu'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { BaiduLanguage } from './config'

export const getTranslator = memoizeOne(
  () =>
    new Baidu({
      env: 'ext',
      config:
        process.env.BAIDU_APPID && process.env.BAIDU_KEY
          ? {
              appid: process.env.BAIDU_APPID,
              key: process.env.BAIDU_KEY
            }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.baidu.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh'
        : config.langCode === 'zh-TW'
        ? 'cht'
        : 'en'
      : profile.dicts.all.baidu.options.tl

  return `https://fanyi.baidu.com/#auto/${lang}/${text}`
}

export type BaiduResult = MachineTranslateResult<'baidu'>

export const search: SearchFunction<
  BaiduResult,
  MachineTranslatePayload<BaiduLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.baidu,
    config,
    payload
  )

  const appid = config.dictAuth.baidu.appid
  const key = config.dictAuth.baidu.key
  const translatorConfig = appid && key ? { appid, key } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return machineResult(
      {
        result: {
          id: 'baidu',
          slInitial: profile.dicts.all.baidu.options.slInitial,
          sl: result.from,
          tl: result.to,
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
          id: 'baidu',
          slInitial: 'hide',
          sl,
          tl,
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] }
        }
      },
      translator.getSupportLanguages()
    )
  }
}
