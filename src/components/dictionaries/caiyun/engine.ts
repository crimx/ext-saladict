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
import { getTranslator as getBaiduTranslator } from '../baidu/engine'

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

  const baiduAppid = config.dictAuth.baidu.appid
  const baiduKey = config.dictAuth.baidu.key
  const baiduConfig =
    baiduAppid && baiduKey ? { appid: baiduAppid, key: baiduKey } : undefined

  const baiduResult = await getBaiduTranslator().translate(
    text,
    sl,
    tl,
    baiduConfig
  )

  if (langcodes.includes(baiduResult.from)) {
    sl = baiduResult.from
  }

  const caiYunToken = config.dictAuth.caiyun.token
  const caiYunConfig = caiYunToken ? { token: caiYunToken } : undefined

  try {
    const result = await translator.translate(text, sl, tl, caiYunConfig)
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
