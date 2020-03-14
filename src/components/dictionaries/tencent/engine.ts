import {
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  getMTArgs
} from '../helpers'
import memoizeOne from 'memoize-one'
import { Tencent } from '@opentranslate/tencent'
import { TencentLanguage } from './config'

const getTranslator = memoizeOne(
  () =>
    new Tencent({
      env: 'ext',
      config:
        process.env.TENCENT_SECRETID && process.env.TENCENT_SECRETKEY
          ? {
              secretId: process.env.TENCENT_SECRETID,
              secretKey: process.env.TENCENT_SECRETKEY
            }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.tencent.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh-CHS'
        : config.langCode === 'zh-TW'
        ? 'zh-CHT'
        : 'en'
      : profile.dicts.all.tencent.options.tl

  return `https://fanyi.qq.com/#auto/${lang}/${text}`
}

export type TencentResult = MachineTranslateResult<'tencent'>

export const search: SearchFunction<
  TencentResult,
  MachineTranslatePayload<TencentLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.tencent,
    config,
    payload
  )

  try {
    const result = await translator.translate(text, sl, tl)
    return {
      result: {
        id: 'tencent',
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
        id: 'tencent',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
