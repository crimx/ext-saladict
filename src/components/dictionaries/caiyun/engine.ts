import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Caiyun } from '@opentranslate/caiyun'
import { TranslateResult } from '@opentranslate/translator'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { getTranslator as getBaiduTranslator } from '../baidu/engine'
import { CaiyunLanguage } from './config'

export const getTranslator = memoizeOne(
  () =>
    new Caiyun({
      env: 'ext',
      config: process.env.CAIYUN_TOKEN
        ? {
            token: process.env.CAIYUN_TOKEN
          }
        : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = () => {
  return 'https://fanyi.caiyunapp.com/'
}

export type CaiyunResult = MachineTranslateResult<'caiyun'>

export const search: SearchFunction<
  CaiyunResult,
  MachineTranslatePayload<CaiyunLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()

  let { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.caiyun,
    config,
    payload
  )

  const baiduTranslator = getBaiduTranslator()

  let baiduResult: TranslateResult | undefined

  try {
    // Caiyun's lang detection is broken
    baiduResult = await baiduTranslator.translate(text, sl, tl)
    if (langcodes.includes(baiduResult.from)) {
      sl = baiduResult.from
    }
  } catch (e) {}

  const caiYunToken = config.dictAuth.caiyun.token
  const caiYunConfig = caiYunToken ? { token: caiYunToken } : undefined

  try {
    const result = await translator.translate(text, sl, tl, caiYunConfig)
    result.origin.tts = await baiduTranslator.textToSpeech(
      result.origin.paragraphs.join('\n'),
      result.from
    )
    result.trans.tts = await baiduTranslator.textToSpeech(
      result.trans.paragraphs.join('\n'),
      result.to
    )
    return machineResult(
      {
        result: {
          id: 'caiyun',
          sl: result.from,
          tl: result.to,
          slInitial: profile.dicts.all.caiyun.options.slInitial,
          searchText: result.origin,
          trans: result.trans
        },
        audio: {
          py: result.trans.tts,
          us: result.trans.tts
        }
      },
      langcodes
    )
  } catch (e) {
    return machineResult(
      {
        result: {
          id: 'caiyun',
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
