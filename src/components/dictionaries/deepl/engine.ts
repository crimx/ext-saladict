import axios from 'axios'
import memoizeOne from 'memoize-one'
import { SearchFunction, GetSrcPageFunction } from '../helpers'
import {
  MachineTranslatePayload,
  MachineTranslateResult,
  getMTArgs
} from '@/components/MachineTrans/engine'
import {
  commonMachineLanguages,
  createLanguageHelper,
  credentialRequiredResult,
  emptyMachineResult,
  normalizeMachineLanguage,
  successMachineResult
} from '../machine-custom'
import { DeepLLanguage } from './config'

export const DEEPL_API_ENDPOINT = 'https://api.deepl.com/v2/translate'
export const DEEPL_FREE_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<DeepLLanguage>(
    commonMachineLanguages as ReadonlyArray<DeepLLanguage>
  )
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const target =
    (profile.dicts.all as any).deepl.options.tl === 'default'
      ? config.langCode
      : (profile.dicts.all as any).deepl.options.tl
  return `https://www.deepl.com/translator#auto/${target}/${encodeURIComponent(
    text
  )}`
}

export type DeepLResult = MachineTranslateResult<any>

export function mapDeepLLanguage(lang: string): string {
  switch (lang) {
    case 'auto':
      return ''
    case 'zh-CN':
      return 'ZH-HANS'
    case 'zh-TW':
      return 'ZH-HANT'
    default:
      return lang.toUpperCase()
  }
}

export function mapDeepLSourceLanguage(lang: string): string {
  switch (lang) {
    case 'auto':
      return ''
    case 'zh-CN':
    case 'zh-TW':
      return 'ZH'
    default:
      return lang.toUpperCase()
  }
}

export function getDeepLEndpoint(authKey: string): string {
  return authKey.endsWith(':fx') ? DEEPL_FREE_API_ENDPOINT : DEEPL_API_ENDPOINT
}

export function buildDeepLPayload(input: {
  text: string
  sourceLanguage: string
  targetLanguage: string
}): {
  text: string[]
  target_lang: string
  source_lang?: string
} {
  const payload: {
    text: string[]
    target_lang: string
    source_lang?: string
  } = {
    text: [input.text],
    target_lang: mapDeepLLanguage(input.targetLanguage)
  }

  const sourceLanguage = mapDeepLSourceLanguage(input.sourceLanguage)
  if (sourceLanguage) {
    payload.source_lang = sourceLanguage
  }

  return payload
}

export function parseDeepLTranslatedText(
  data: any
): {
  translatedText: string
  detectedLanguage?: string
} {
  const translation = Array.isArray(data?.translations)
    ? data.translations[0]
    : undefined

  return {
    translatedText:
      translation?.text ||
      data?.text ||
      data?.translation ||
      data?.translatedText ||
      '',
    detectedLanguage:
      translation?.detected_source_language ||
      data?.detected_source_language ||
      data?.detectedSourceLanguage
  }
}

export const search: SearchFunction<
  DeepLResult,
  MachineTranslatePayload<DeepLLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    (profile.dicts.all as any).deepl,
    config,
    payload
  )
  const sourceLanguage = payload.sl || 'auto'

  const auth = (config.dictAuth as any).deepl || {}
  const authKey = auth.authKey
  if (!authKey) {
    return credentialRequiredResult('deepl', langcodes)
  }

  try {
    const response = await axios.post(
      getDeepLEndpoint(authKey),
      buildDeepLPayload({
        text,
        sourceLanguage,
        targetLanguage: tl
      }),
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${authKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    const parsed = parseDeepLTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('deepl', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'deepl',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sourceLanguage),
      tl,
      slInitial: (profile.dicts.all as any).deepl.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('deepl', sl, tl, langcodes)
  }
}
