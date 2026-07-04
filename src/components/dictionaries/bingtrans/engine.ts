import axios from 'axios'
import memoizeOne from 'memoize-one'
import { SearchFunction, GetSrcPageFunction } from '../helpers'
import {
  MachineTranslatePayload,
  MachineTranslateResult,
  getMTArgs
} from '@/components/MachineTrans/engine'
import {
  createLanguageHelper,
  emptyMachineResult,
  normalizeMachineLanguage,
  successMachineResult
} from '../machine-custom'
import { BingtransLanguage } from './config'

// ---------------------------------------------------------------------------
// Microsoft / Bing Translator via the keyless Edge auth endpoint.
//
// Flow:
// 1. GET  https://edge.microsoft.com/translate/auth        → JWT token (~10 min)
// 2. POST https://api-edge.cognitive.microsofttranslator.com/translate
//         ?api-version=3.0&to=<tl>[&from=<sl>]
//    Body: [{ "Text": "..." }]  Header: Authorization: Bearer <token>
//
// The same endpoints power the Edge browser's built-in translator, so no API
// key or account is required.
// ---------------------------------------------------------------------------

export const BING_AUTH_ENDPOINT = 'https://edge.microsoft.com/translate/auth'

export const BING_TRANSLATE_ENDPOINT =
  'https://api-edge.cognitive.microsofttranslator.com/translate'

const SUPPORTED_LANGUAGES: ReadonlyArray<BingtransLanguage> = [
  'zh-CN',
  'zh-TW',
  'en',
  'ja',
  'ko',
  'fr',
  'de',
  'es',
  'ru',
  'nl',
  'pt'
]

/**
 * The auth token is valid for ~10 minutes. Cache it a little shorter so a
 * request never races the expiry, and avoid one auth round-trip per lookup.
 */
const AUTH_TOKEN_TTL = 8 * 60 * 1000

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<BingtransLanguage>(SUPPORTED_LANGUAGES)
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const tl = profile.dicts.all.bingtrans.options.tl
  const lang =
    tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh-Hans'
        : config.langCode === 'zh-TW'
        ? 'zh-Hant'
        : 'en'
      : mapBingLanguage(tl)

  return `https://www.bing.com/translator/?from=auto&to=${lang}&text=${encodeURIComponent(
    text
  )}`
}

export type BingtransResult = MachineTranslateResult<'bingtrans'>

/** Map Saladict / @opentranslate language codes → Microsoft Translator codes. */
export function mapBingLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'zh-Hans'
    case 'zh-TW':
      return 'zh-Hant'
    default:
      return lang
  }
}

export function buildBingTranslateParams(input: {
  sourceLanguage: string
  targetLanguage: string
}): string {
  const params = new URLSearchParams()
  params.set('api-version', '3.0')
  params.set('to', mapBingLanguage(input.targetLanguage))
  // Omitting `from` lets Microsoft auto-detect the source language.
  if (input.sourceLanguage && input.sourceLanguage !== 'auto') {
    params.set('from', mapBingLanguage(input.sourceLanguage))
  }
  return params.toString()
}

export function parseBingTranslatedText(
  data: any
): {
  translatedText: string
  detectedLanguage?: string
} {
  const entry = Array.isArray(data) ? data[0] : undefined
  return {
    translatedText: entry?.translations?.[0]?.text || '',
    detectedLanguage: entry?.detectedLanguage?.language
  }
}

let cachedToken: { token: string; expiry: number } | null = null

export function resetBingAuthToken(): void {
  cachedToken = null
}

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry) {
    return cachedToken.token
  }
  const response = await axios.get<string>(BING_AUTH_ENDPOINT, {
    responseType: 'text'
  })
  const token = typeof response.data === 'string' ? response.data.trim() : ''
  cachedToken = { token, expiry: Date.now() + AUTH_TOKEN_TTL }
  return token
}

export const search: SearchFunction<
  BingtransResult,
  MachineTranslatePayload<BingtransLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    profile.dicts.all.bingtrans,
    config,
    payload
  )
  const sourceLanguage = payload.sl || 'auto'

  try {
    const token = await getAuthToken()
    const response = await axios.post(
      `${BING_TRANSLATE_ENDPOINT}?${buildBingTranslateParams({
        sourceLanguage,
        targetLanguage: tl
      })}`,
      [{ Text: text }],
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    const parsed = parseBingTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('bingtrans', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'bingtrans',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sourceLanguage),
      tl,
      slInitial: profile.dicts.all.bingtrans.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('bingtrans', sl, tl, langcodes)
  }
}
