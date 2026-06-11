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
  credentialErrorResult,
  credentialRequiredResult,
  emptyMachineResult,
  getAxiosCredentialError,
  normalizeMachineLanguage,
  successMachineResult
} from '../machine-custom'
import { DeepLXLanguage } from './config'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<DeepLXLanguage>(
    commonMachineLanguages as ReadonlyArray<DeepLXLanguage>
  )
)

export const getSrcPage: GetSrcPageFunction = () =>
  'https://github.com/OwO-Network/DeepLX'

export type DeepLXResult = MachineTranslateResult<any>

export function mapDeepLXLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'ZH-HANS'
    case 'zh-TW':
      return 'ZH-HANT'
    case 'auto':
      return 'auto'
    default:
      return lang.toUpperCase()
  }
}

export function hasDeepLXApiKeyPlaceholder(apiUrl: string): boolean {
  return apiUrl.includes('{{apiKey}}')
}

export function buildDeepLXUrl(apiUrl: string, apiKey = ''): string {
  const replaced = apiUrl
    .trim()
    .replace(/\{\{apiKey\}\}/g, encodeURIComponent(apiKey))

  try {
    const url = new URL(replaced)
    const pathname = url.pathname.replace(/\/+$/, '')
    if (/\/translate$/i.test(pathname)) {
      url.pathname = pathname
    } else {
      url.pathname = `${pathname}/translate`
    }
    return url.toString()
  } catch (e) {
    const trimmed = replaced.replace(/\/+$/, '')
    return /\/translate$/i.test(trimmed) ? trimmed : `${trimmed}/translate`
  }
}

export function buildDeepLXPayload(input: {
  text: string
  sourceLanguage: string
  targetLanguage: string
}): {
  text: string
  source_lang: string
  target_lang: string
} {
  return {
    text: input.text,
    source_lang: mapDeepLXLanguage(input.sourceLanguage),
    target_lang: mapDeepLXLanguage(input.targetLanguage)
  }
}

export function parseDeepLXTranslatedText(
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
      (typeof data?.data === 'string' ? data.data : '') ||
      data?.translation ||
      data?.translated ||
      data?.translatedText ||
      translation?.text ||
      '',
    detectedLanguage:
      data?.source_lang ||
      data?.sourceLanguage ||
      data?.detected_source_language ||
      data?.detectedSourceLanguage ||
      translation?.detected_source_language
  }
}

export const search: SearchFunction<
  DeepLXResult,
  MachineTranslatePayload<DeepLXLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    (profile.dicts.all as any).deeplx,
    config,
    payload
  )
  const sourceLanguage = payload.sl || 'auto'

  const auth = (config.dictAuth as any).deeplx || {}
  const apiUrl = typeof auth.apiUrl === 'string' ? auth.apiUrl.trim() : ''
  if (!apiUrl) {
    return credentialRequiredResult('deeplx', langcodes)
  }
  const token = auth.token || ''
  const tokenInUrl = hasDeepLXApiKeyPlaceholder(apiUrl)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token && !tokenInUrl) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await axios.post(
      buildDeepLXUrl(apiUrl, token),
      buildDeepLXPayload({
        text,
        sourceLanguage,
        targetLanguage: tl
      }),
      { headers }
    )
    const parsed = parseDeepLXTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('deeplx', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'deeplx',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sourceLanguage),
      tl,
      slInitial: (profile.dicts.all as any).deeplx.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    const credentialError = getAxiosCredentialError(e)
    if (credentialError) {
      return credentialErrorResult('deeplx', credentialError, langcodes)
    }
    return emptyMachineResult('deeplx', sl, tl, langcodes)
  }
}
