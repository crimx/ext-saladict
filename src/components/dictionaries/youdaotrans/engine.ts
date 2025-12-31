import axios from 'axios'
import { SearchFunction, GetSrcPageFunction, handleNoResult } from '../helpers'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  machineResult
} from '@/components/MachineTrans/engine'
import {
  isContainChinese,
  isContainJapanese,
  isContainKorean
} from '@/_helpers/lang-check'
import { YoudaotransLanguage } from './config'

export const getSrcPage: GetSrcPageFunction = () => {
  return 'https://fanyi.youdao.com'
}

export type YoudaotransResult = MachineTranslateResult<'youdaotrans'>

const langcodes: ReadonlyArray<string> = [
  'auto',
  'zh-CN',
  'en',
  'ja',
  'ko',
  'fr',
  'es',
  'pt',
  'ru',
  'vi',
  'de',
  'ar',
  'id',
  'it'
]

// Language code mapping (standard -> youdao)
const langMap: Record<string, string> = {
  'zh-CN': 'zh-CHS',
  'zh-TW': 'zh-CHT',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  fr: 'fr',
  es: 'es',
  pt: 'pt',
  ru: 'ru',
  vi: 'vi',
  de: 'de',
  ar: 'ar',
  id: 'id',
  it: 'it',
  auto: 'auto'
}

export const search: SearchFunction<
  YoudaotransResult,
  MachineTranslatePayload<YoudaotransLanguage>
> = async (rawText, config, profile, payload) => {
  const options = profile.dicts.all.youdaotrans.options

  let text = rawText

  if (
    options.keepLF === 'none' ||
    (options.keepLF === 'pdf' && !payload.isPDF) ||
    (options.keepLF === 'webpage' && payload.isPDF)
  ) {
    text = text.replace(/\n+/g, ' ')
  }

  // Language detection
  let sl: string = payload.sl || 'auto'
  if (sl === 'auto') {
    if (isContainJapanese(text)) {
      sl = 'ja'
    } else if (isContainKorean(text)) {
      sl = 'ko'
    } else if (isContainChinese(text)) {
      sl = 'zh-CN'
    } else {
      sl = 'en'
    }
  }

  let tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode.startsWith('zh')
        ? 'zh-CN'
        : 'en'
      : options.tl)

  // Switch target language if same as source
  if (sl === tl) {
    if (sl === 'zh-CN') {
      tl = 'en'
    } else {
      tl = 'zh-CN'
    }
  }

  const slCode = langMap[sl] || 'auto'
  const tlCode = langMap[tl] || 'zh-CHS'

  try {
    const response = await axios({
      url: 'https://aidemo.youdao.com/trans',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `q=${encodeURIComponent(text)}&from=${slCode}&to=${tlCode}`
    })

    const result = response.data

    if (
      !result ||
      (result.errorCode !== 0 && result.errorCode !== '0') ||
      !result.translation
    ) {
      return handleNoResult()
    }

    const transParagraphs: string[] = result.translation
    const srcParagraphs = text.split(/\n+/)

    // Get detected language from response
    const detectedLang = result.l?.split('2')[0]
    const actualSl =
      Object.keys(langMap).find(k => langMap[k] === detectedLang) || sl
    const actualTl =
      Object.keys(langMap).find(k => langMap[k] === result.l?.split('2')[1]) ||
      tl

    return machineResult(
      {
        result: {
          id: 'youdaotrans',
          sl: actualSl,
          tl: actualTl,
          slInitial: options.slInitial,
          searchText: {
            paragraphs: srcParagraphs,
            tts: result.speakUrl || undefined
          },
          trans: {
            paragraphs: transParagraphs,
            tts: result.tSpeakUrl || undefined
          }
        },
        audio: result.tSpeakUrl
          ? {
              us: result.tSpeakUrl
            }
          : undefined
      },
      langcodes
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
      langcodes
    )
  }
}
