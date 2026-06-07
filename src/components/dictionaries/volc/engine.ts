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
  hmacBytes,
  hmacHex,
  normalizeMachineLanguage,
  sha256Hex,
  successMachineResult
} from '../machine-custom'
import { VolcLanguage } from './config'

export const VOLC_ENDPOINT = 'https://translate.volcengineapi.com'

const VOLC_REGION = 'cn-north-1'
const VOLC_SERVICE = 'translate'
const VOLC_QUERY = 'Action=TranslateText&Version=2020-06-01'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<VolcLanguage>(
    commonMachineLanguages as ReadonlyArray<VolcLanguage>
  )
)

export const getSrcPage: GetSrcPageFunction = () =>
  'https://translate.volcengine.com/'

export type VolcResult = MachineTranslateResult<any>

export function mapVolcLanguage(lang: string): string {
  switch (lang) {
    case 'auto':
      return ''
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'zh-Hant'
    default:
      return lang
  }
}

export async function buildVolcSignedRequest(
  input: {
    accessKeyId: string
    secretAccessKey: string
    sourceText: string
    sourceLanguage: string
    targetLanguage: string
  },
  now = new Date()
): Promise<{
  url: string
  body: string
  headers: Record<string, string>
}> {
  const xDate = formatVolcDate(now)
  const dateStamp = xDate.slice(0, 8)
  const sourceLanguage = mapVolcLanguage(input.sourceLanguage)
  const body = JSON.stringify({
    ...(sourceLanguage ? { SourceLanguage: sourceLanguage } : {}),
    TargetLanguage: mapVolcLanguage(input.targetLanguage),
    TextList: [input.sourceText]
  })
  const payloadHash = await sha256Hex(body)
  const canonicalHeaders = [
    'content-type:application/json',
    'host:translate.volcengineapi.com',
    `x-content-sha256:${payloadHash}`,
    `x-date:${xDate}`
  ].join('\n')
  const signedHeaders = 'content-type;host;x-content-sha256;x-date'
  const canonicalRequest = [
    'POST',
    '/',
    VOLC_QUERY,
    canonicalHeaders + '\n',
    signedHeaders,
    payloadHash
  ].join('\n')
  const scope = `${dateStamp}/${VOLC_REGION}/${VOLC_SERVICE}/request`
  const stringToSign = [
    'HMAC-SHA256',
    xDate,
    scope,
    await sha256Hex(canonicalRequest)
  ].join('\n')
  const signature = await hmacHex(
    'SHA-256',
    await getVolcSigningKey(input.secretAccessKey, dateStamp),
    stringToSign
  )

  return {
    url: `${VOLC_ENDPOINT}?${VOLC_QUERY}`,
    body,
    headers: {
      Authorization: [
        `HMAC-SHA256 Credential=${input.accessKeyId}/${scope}`,
        `SignedHeaders=${signedHeaders}`,
        `Signature=${signature}`
      ].join(', '),
      'Content-Type': 'application/json',
      'X-Content-Sha256': payloadHash,
      'X-Date': xDate
    }
  }
}

export function parseVolcTranslatedText(
  data: any
): {
  translatedText: string
  detectedLanguage?: string
} {
  const translationList =
    data?.TranslationList ||
    data?.translationList ||
    data?.Result?.TranslationList ||
    data?.result?.translationList ||
    data?.ResponseMetadata?.TranslationList ||
    []
  const translations = Array.isArray(translationList)
    ? translationList
        .map(
          item =>
            item?.Translation ||
            item?.translation ||
            item?.TranslatedText ||
            item?.translatedText ||
            item?.TargetText ||
            item?.targetText ||
            ''
        )
        .filter(Boolean)
    : []
  const first = Array.isArray(translationList) ? translationList[0] : undefined

  return {
    translatedText:
      translations.join('\n') ||
      data?.Translation ||
      data?.translation ||
      data?.Result?.Translation ||
      data?.result?.translation ||
      data?.TranslatedText ||
      data?.translatedText ||
      data?.Result?.TranslatedText ||
      data?.result?.translatedText ||
      '',
    detectedLanguage:
      first?.DetectedSourceLanguage ||
      first?.detectedSourceLanguage ||
      first?.SourceLanguage ||
      first?.sourceLanguage ||
      data?.DetectedSourceLanguage ||
      data?.detectedSourceLanguage ||
      data?.Result?.DetectedSourceLanguage ||
      data?.result?.detectedSourceLanguage
  }
}

export const search: SearchFunction<
  VolcResult,
  MachineTranslatePayload<VolcLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    (profile.dicts.all as any).volc,
    config,
    payload
  )
  const sourceLanguage = payload.sl || 'auto'

  const auth = (config.dictAuth as any).volc || {}
  const accessKeyId = auth.accessKeyId
  const secretAccessKey = auth.secretAccessKey
  if (!accessKeyId || !secretAccessKey) {
    return credentialRequiredResult('volc', langcodes)
  }

  try {
    const request = await buildVolcSignedRequest({
      accessKeyId,
      secretAccessKey,
      sourceText: text,
      sourceLanguage,
      targetLanguage: tl
    })
    const response = await axios.post(request.url, request.body, {
      headers: request.headers
    })
    const parsed = parseVolcTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('volc', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'volc',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sourceLanguage),
      tl,
      slInitial: (profile.dicts.all as any).volc.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('volc', sl, tl, langcodes)
  }
}

async function getVolcSigningKey(
  secretAccessKey: string,
  dateStamp: string
): Promise<Uint8Array> {
  const dateKey = await hmacBytes('SHA-256', secretAccessKey, dateStamp)
  const regionKey = await hmacBytes('SHA-256', dateKey, VOLC_REGION)
  const serviceKey = await hmacBytes('SHA-256', regionKey, VOLC_SERVICE)
  return hmacBytes('SHA-256', serviceKey, 'request')
}

function formatVolcDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}
