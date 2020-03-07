import {
  MachineTranslateResult,
  SearchFunction,
  MachineTranslatePayload,
  GetSrcPageFunction,
  getMTArgs
} from '../helpers'
import memoizeOne from 'memoize-one'
import { Caiyun } from '@opentranslate/caiyun'
import { CaiyunLanguage } from './config'
import { translate as baiduTranslate } from '../baidu/engine'

const getTranslator = memoizeOne(
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

  const baiduResult = await baiduTranslate(text, sl, tl)

  if (langcodes.includes(baiduResult.from)) {
    sl = baiduResult.from
  }

  try {
    const result = await translator.translate(text, sl, tl)
    result.origin.tts = baiduResult.origin.tts
    result.trans.tts = baiduResult.trans.tts
    return {
      result: {
        id: 'caiyun',
        sl: result.from,
        tl: result.to,
        langcodes,
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
        id: 'caiyun',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
