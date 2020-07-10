import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Tencent } from '@opentranslate/tencent'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { getTranslator as getBaiduTranslator } from '../baidu/engine'
import { TencentLanguage } from './config'

export const getTranslator = memoizeOne(
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

  const secretId = config.dictAuth.tencent.secretId
  const secretKey = config.dictAuth.tencent.secretKey
  const translatorConfig =
    secretId && secretKey ? { secretId, secretKey } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    // Tencent needs extra api credits for TTS which does
    // not fit in the current Saladict architecture.
    // Use Baidu instead.
    const baidu = getBaiduTranslator()
    result.origin.tts = await baidu.textToSpeech(
      result.origin.paragraphs.join('\n'),
      result.from
    )
    result.trans.tts = await baidu.textToSpeech(
      result.trans.paragraphs.join('\n'),
      result.to
    )

    return machineResult(
      {
        result: {
          id: 'tencent',
          sl: result.from,
          tl: result.to,
          slInitial: profile.dicts.all.tencent.options.slInitial,
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
          id: 'tencent',
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
