import axios from 'axios'
import { SearchFunction, GetSrcPageFunction, handleNoResult } from '../helpers'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  machineResult
} from '@/components/MachineTrans/engine'
import { isContainChinese, isContainJapanese } from '@/_helpers/lang-check'
import { CaiyunLanguage } from './config'

export const getSrcPage: GetSrcPageFunction = () => {
  return 'https://fanyi.caiyunapp.com/'
}

export type CaiyunResult = MachineTranslateResult<'caiyun'>

const langcodes: ReadonlyArray<string> = ['zh-CN', 'ja', 'en']

export const search: SearchFunction<
  CaiyunResult,
  MachineTranslatePayload<CaiyunLanguage>
> = async (rawText, config, profile, payload) => {
  const options = profile.dicts.all.caiyun.options

  let text = rawText

  if (
    options.keepLF === 'none' ||
    (options.keepLF === 'pdf' && !payload.isPDF) ||
    (options.keepLF === 'webpage' && payload.isPDF)
  ) {
    text = text.replace(/\n+/g, ' ')
  }

  let sl: string =
    payload.sl ||
    (isContainJapanese(text) ? 'ja' : isContainChinese(text) ? 'zh-CN' : 'en')

  let tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode.startsWith('zh')
        ? 'zh-CN'
        : 'en'
      : options.tl)

  if (sl === tl) {
    if (isContainJapanese(text)) {
      sl = 'ja'
      if (tl === 'ja') {
        tl = config.langCode.startsWith('zh') ? 'zh-CN' : 'en'
      }
    } else if (isContainChinese(text)) {
      sl = 'zh-CN'
      if (tl === 'zh-CN') {
        tl = 'en'
      }
    } else {
      sl = 'en'
      if (tl === 'en') {
        tl = 'zh-CN'
      }
    }
  }

  // Caiyun API language codes
  const slCode = sl === 'zh-CN' ? 'zh' : sl
  const tlCode = tl === 'zh-CN' ? 'zh' : tl

  // Caiyun requires user API token
  const userToken = config.dictAuth.caiyun.token
  if (!userToken) {
    return machineResult(
      {
        result: {
          id: 'caiyun',
          sl,
          tl,
          slInitial: 'hide',
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] },
          requireCredential: true
        }
      },
      langcodes
    )
  }

  try {
    const response = await axios({
      url: 'https://api.interpreter.caiyunai.com/v1/translator',
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Authorization': userToken
      },
      data: {
        source: text.split(/\n+/),
        trans_type: `${slCode}2${tlCode}`,
        detect: sl === 'auto'
      }
    })

    const result = response.data

    if (!result || !result.target) {
      return handleNoResult()
    }

    const transParagraphs: string[] = result.target
    const srcParagraphs = text.split(/\n+/)

    const transText = transParagraphs.join('\n')
    const srcText = srcParagraphs.join('\n')

    return machineResult(
      {
        result: {
          id: 'caiyun',
          sl,
          tl,
          slInitial: options.slInitial,
          searchText: {
            paragraphs: srcParagraphs,
            tts:
              srcText.length <= 200
                ? `https://fanyi.baidu.com/gettts?lan=${slCode}&text=${encodeURIComponent(
                    srcText
                  )}&spd=3&source=web`
                : undefined
          },
          trans: {
            paragraphs: transParagraphs,
            tts:
              transText.length <= 200
                ? `https://fanyi.baidu.com/gettts?lan=${tlCode}&text=${encodeURIComponent(
                    transText
                  )}&spd=3&source=web`
                : undefined
          }
        },
        audio:
          transText.length <= 200
            ? {
                us: `https://fanyi.baidu.com/gettts?lan=${tlCode}&text=${encodeURIComponent(
                  transText
                )}&spd=3&source=web`
              }
            : undefined
      },
      langcodes
    )
  } catch (e) {
    // Return empty result
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
      langcodes
    )
  }
}
