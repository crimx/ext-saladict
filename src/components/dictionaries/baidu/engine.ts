import { SearchFunction, GetSrcPageFunction } from '../helpers'
import axios from 'axios'
import memoizeOne from 'memoize-one'
import { Baidu } from '@opentranslate/baidu'
import md5 from 'md5'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import {
  credentialRequiredResult,
  normalizeMachineLanguage,
  splitParagraphs
} from '../machine-custom'
import { BaiduLanguage } from './config'

export const BAIDU_ENDPOINT =
  'https://api.fanyi.baidu.com/api/trans/vip/translate'

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

export function mapBaiduLanguage(lang: string): string {
  switch (lang) {
    case 'auto':
      return 'auto'
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'cht'
    case 'ja':
      return 'jp'
    case 'ko':
      return 'kor'
    case 'fr':
      return 'fra'
    case 'es':
      return 'spa'
    default:
      return lang
  }
}

export function buildBaiduParams({
  appid,
  key,
  sourceText,
  sourceLanguage,
  targetLanguage,
  salt = String(Date.now())
}: {
  appid: string
  key: string
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  salt?: string
}) {
  return {
    q: sourceText,
    from: mapBaiduLanguage(sourceLanguage),
    to: mapBaiduLanguage(targetLanguage),
    appid,
    salt,
    sign: md5(appid + sourceText + salt + key)
  }
}

export function parseBaiduTranslatedText(data: any): {
  translatedText: string
  sourceText: string
  detectedLanguage?: string
} {
  const transResult = Array.isArray(data?.trans_result)
    ? data.trans_result
    : []

  return {
    translatedText: transResult
      .map((item: any) => item?.dst || '')
      .filter(Boolean)
      .join('\n'),
    sourceText: transResult
      .map((item: any) => item?.src || '')
      .filter(Boolean)
      .join('\n'),
    detectedLanguage: data?.from
  }
}

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

  const appid = config.dictAuth.baidu.appid.trim()
  const key = config.dictAuth.baidu.key.trim()
  const translatorConfig = appid && key ? { appid, key } : undefined

  if (!translatorConfig) {
    return credentialRequiredResult('baidu', translator.getSupportLanguages())
  }

  try {
    const response = await axios.get(BAIDU_ENDPOINT, {
      params: buildBaiduParams({
        appid,
        key,
        sourceText: text,
        sourceLanguage: payload.sl || 'auto',
        targetLanguage: tl
      })
    })
    const parsed = parseBaiduTranslatedText(response.data)
    if (!parsed.translatedText) {
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

    const detectedFrom = normalizeMachineLanguage(parsed.detectedLanguage || sl)
    const sourceText = parsed.sourceText || text
    const transText = parsed.translatedText
    return machineResult(
      {
        result: {
          id: 'baidu',
          slInitial: profile.dicts.all.baidu.options.slInitial,
          sl: detectedFrom,
          tl,
          searchText: {
            paragraphs: splitParagraphs(sourceText),
            tts: await translator.textToSpeech(sourceText, detectedFrom as any)
          },
          trans: {
            paragraphs: splitParagraphs(transText),
            tts: await translator.textToSpeech(transText, tl as any)
          }
        },
        audio: {
          py: await translator.textToSpeech(transText, tl as any),
          us: await translator.textToSpeech(transText, tl as any)
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
