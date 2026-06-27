import { DictID } from '@/app-config'
import axios from 'axios'
import { Language } from '@opentranslate/languages'
import {
  isContainChinese,
  isContainDeutsch,
  isContainEnglish,
  isContainFrench,
  isContainJapanese,
  isContainKorean,
  isContainSpanish
} from '@/_helpers/lang-check'
import { DictSearchResult } from './helpers'
import {
  MachineCredentialError,
  MachineTranslateResult,
  machineResult
} from '@/components/MachineTrans/engine'

export const commonMachineLanguages = [
  'zh-CN',
  'zh-TW',
  'en',
  'ja',
  'ko',
  'fr',
  'de',
  'es',
  'ru'
] as const

export type CommonMachineLanguage = typeof commonMachineLanguages[number]

export interface LocalLanguageHelper<Lang extends Language = Language> {
  detect(text: string): Lang | 'auto'
  getSupportLanguages(): Array<Lang | 'auto'>
}

export function createLanguageHelper<Lang extends Language>(
  langs: ReadonlyArray<Lang>
): LocalLanguageHelper<Lang> {
  const supported = Array.from(
    new Set<Lang | 'auto'>(['auto', ...langs])
  )
  return {
    detect(text: string): Lang | 'auto' {
      const detected = detectLocalLanguage(text)
      return isSupportedLanguage(detected, supported) ? detected : 'auto'
    },
    getSupportLanguages(): Array<Lang | 'auto'> {
      return supported.slice()
    }
  }
}

function isSupportedLanguage<Lang extends Language>(
  lang: Language | 'auto',
  supported: ReadonlyArray<Lang | 'auto'>
): lang is Lang | 'auto' {
  return supported.includes(lang as Lang | 'auto')
}

export function detectLocalLanguage(
  text: string
): CommonMachineLanguage | 'auto' {
  if (isContainJapanese(text)) return 'ja'
  if (isContainKorean(text)) return 'ko'
  if (isContainChinese(text)) return 'zh-CN'
  if (isContainFrench(text)) return 'fr'
  if (isContainDeutsch(text)) return 'de'
  if (isContainSpanish(text)) return 'es'
  if (isContainEnglish(text)) return 'en'
  return 'auto'
}

export function normalizeMachineLanguage(lang: string): string {
  const normalized = lang.toLowerCase()
  switch (normalized) {
    case 'zh':
    case 'zh-cn':
    case 'zh_chs':
    case 'zh-chs':
    case 'zh-hans':
      return 'zh-CN'
    case 'cht':
    case 'zh-tw':
    case 'zh_cht':
    case 'zh-cht':
    case 'zh-hant':
      return 'zh-TW'
    case 'jp':
      return 'ja'
    case 'kr':
      return 'ko'
    default:
      return normalized
  }
}

export function credentialRequiredResult<ID extends DictID>(
  id: ID,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  return credentialErrorResult(id, 'missing', langcodes)
}

export function credentialErrorResult<ID extends DictID>(
  id: ID,
  error: MachineCredentialError,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        credentialError: error,
        requireCredential: true,
        id,
        sl: 'auto',
        tl: 'auto',
        slInitial: 'hide',
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    },
    langcodes
  )
}

export function getCredentialErrorFromHttpStatus(
  status?: number
): MachineCredentialError | undefined {
  switch (status) {
    case 401:
    case 403:
      return 'invalid'
    case 402:
    case 429:
    case 456:
      return 'quota'
    default:
      return undefined
  }
}

export function getAxiosCredentialError(
  e: unknown
): MachineCredentialError | undefined {
  if (!axios.isAxiosError(e)) {
    return undefined
  }
  return getCredentialErrorFromHttpStatus(e.response?.status)
}

export function getAlibabaCredentialError(
  data: any
): MachineCredentialError | undefined {
  const code = normalizeErrorText(
    data?.Code || data?.code || data?.Error?.Code || data?.error?.code
  )
  const message = normalizeErrorText(
    data?.Message ||
      data?.message ||
      data?.Error?.Message ||
      data?.error?.message
  )
  const combined = `${code} ${message}`

  if (
    /InvalidAccessKeyId|InvalidAccessKeySecret|SignatureDoesNotMatch|IncompleteSignature|Forbidden|Unauthorized/i.test(
      combined
    )
  ) {
    return 'invalid'
  }

  if (/Quota|LimitExceeded|Throttl|Balance|Insufficient/i.test(combined)) {
    return 'quota'
  }

  return undefined
}

export function getVolcCredentialError(
  data: any
): MachineCredentialError | undefined {
  const metadata = data?.ResponseMetadata || data?.responseMetadata || {}
  const error =
    metadata.Error || metadata.error || data?.Error || data?.error || {}
  const code = normalizeErrorText(
    error.Code || error.code || data?.Code || data?.code
  )
  const message = normalizeErrorText(
    error.Message || error.message || data?.Message || data?.message
  )
  const combined = `${code} ${message}`

  if (
    /AuthFailure|InvalidAccessKey|InvalidSecret|Signature|AccessDenied|Unauthorized|Forbidden/i.test(
      combined
    )
  ) {
    return 'invalid'
  }

  if (/Quota|Limit|FlowLimit|Throttl|Balance|Insufficient/i.test(combined)) {
    return 'quota'
  }

  return undefined
}

export function getNiuTransCredentialError(
  data: any
): MachineCredentialError | undefined {
  const code = normalizeErrorText(
    data?.error_code || data?.errorCode || data?.code || data?.Code
  )
  const message = normalizeErrorText(
    data?.error_msg ||
      data?.errorMsg ||
      data?.msg ||
      data?.message ||
      data?.Message
  )
  const combined = `${code} ${message}`

  if (/apikey|api key|auth|token|unauthorized|forbidden/i.test(combined)) {
    return 'invalid'
  }

  if (
    /quota|balance|limit|frequency|insufficient|arrears|欠费|余额|额度|频率/i.test(
      combined
    )
  ) {
    return 'quota'
  }

  return undefined
}

export function getTencentCredentialError(
  e: unknown
): MachineCredentialError | undefined {
  const error = axios.isAxiosError(e)
    ? e.response?.data?.Response?.Error || e.response?.data?.response?.error
    : undefined
  const code = normalizeErrorText(error?.Code || error?.code)
  const message = normalizeErrorText(error?.Message || error?.message)
  const combined = `${code} ${message}`

  if (
    /AuthFailure|InvalidCredential|InvalidSecret|SignatureFailure|Unauthorized|Forbidden/i.test(
      combined
    )
  ) {
    return 'invalid'
  }

  if (
    /LimitExceeded|ResourceInsufficient|Quota|Balance|Insufficient/i.test(
      combined
    )
  ) {
    return 'quota'
  }

  return getAxiosCredentialError(e)
}

export function emptyMachineResult<ID extends DictID>(
  id: ID,
  sl: string,
  tl: string,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        id,
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

function normalizeErrorText(value: any): string {
  return value == null ? '' : String(value)
}

export function successMachineResult<ID extends DictID>({
  id,
  sl,
  tl,
  slInitial,
  sourceText,
  translatedText,
  langcodes
}: {
  id: ID
  sl: string
  tl: string
  slInitial: MachineTranslateResult<ID>['slInitial']
  sourceText: string
  translatedText: string
  langcodes: ReadonlyArray<string>
}): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        id,
        sl,
        tl,
        slInitial,
        searchText: { paragraphs: splitParagraphs(sourceText) },
        trans: { paragraphs: splitParagraphs(translatedText) }
      }
    },
    langcodes
  )
}

export function splitParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n+/).filter(Boolean)
  return paragraphs.length > 0 ? paragraphs : ['']
}

export function percentEncodeRFC3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    char =>
      `%${char
        .charCodeAt(0)
        .toString(16)
        .toUpperCase()}`
  )
}

export function encodeSortedQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map(
      key => `${percentEncodeRFC3986(key)}=${percentEncodeRFC3986(params[key])}`
    )
    .join('&')
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await getSubtleCrypto().digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )
  return bytesToHex(new Uint8Array(digest))
}

export async function hmacHex(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<string> {
  return bytesToHex(await hmacBytes(hash, key, text))
}

export async function hmacBase64(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<string> {
  return bytesToBase64(await hmacBytes(hash, key, text))
}

export async function hmacBytes(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<Uint8Array> {
  const rawKey = typeof key === 'string' ? new TextEncoder().encode(key) : key
  const cryptoKey = await getSubtleCrypto().importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: { name: hash } },
    false,
    ['sign']
  )
  const signature = await getSubtleCrypto().sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(text)
  )
  return new Uint8Array(signature)
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return globalThis.btoa(binary)
}

function getSubtleCrypto(): SubtleCrypto {
  if (globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle
  }
  throw new Error('WebCrypto subtle API is unavailable.')
}
