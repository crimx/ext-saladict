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
  encodeSortedQuery,
  hmacBase64,
  normalizeMachineLanguage,
  percentEncodeRFC3986,
  successMachineResult
} from '../machine-custom'
import { AlibabaLanguage } from './config'

export const ALIBABA_ENDPOINT = 'https://mt.aliyuncs.com/'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<AlibabaLanguage>(
    commonMachineLanguages as ReadonlyArray<AlibabaLanguage>
  )
)

export const getSrcPage: GetSrcPageFunction = () =>
  'https://www.aliyun.com/product/ai/alimt'

export type AlibabaResult = MachineTranslateResult<any>

export function mapAlibabaLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'zh-tw'
    default:
      return lang
  }
}

export async function buildAlibabaSignedUrl(
  input: {
    accessKeyId: string
    accessKeySecret: string
    sourceText: string
    sourceLanguage: string
    targetLanguage: string
  },
  now = new Date(),
  nonce = Math.random()
    .toString(36)
    .slice(2)
): Promise<string> {
  const params: Record<string, string> = {
    AccessKeyId: input.accessKeyId,
    Action: 'TranslateGeneral',
    Format: 'JSON',
    FormatType: 'text',
    Scene: 'general',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: nonce,
    SignatureVersion: '1.0',
    SourceLanguage: mapAlibabaLanguage(input.sourceLanguage),
    SourceText: input.sourceText,
    TargetLanguage: mapAlibabaLanguage(input.targetLanguage),
    Timestamp: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2018-10-12'
  }
  const canonicalQuery = encodeSortedQuery(params)
  const stringToSign = `GET&%2F&${percentEncodeRFC3986(canonicalQuery)}`
  const signature = await hmacBase64(
    'SHA-1',
    `${input.accessKeySecret}&`,
    stringToSign
  )
  return `${ALIBABA_ENDPOINT}?${canonicalQuery}&Signature=${percentEncodeRFC3986(
    signature
  )}`
}

export function parseAlibabaTranslatedText(data: any): {
  translatedText: string
  detectedLanguage?: string
} {
  const rawData =
    typeof data?.Data === 'string'
      ? safeJsonParse(data.Data)
      : data?.Data || data?.data || data

  return {
    translatedText:
      rawData?.Translated ||
      rawData?.translated ||
      rawData?.TranslatedText ||
      rawData?.translatedText ||
      '',
    detectedLanguage:
      rawData?.DetectedLanguage ||
      rawData?.detectedLanguage ||
      rawData?.SourceLanguage
  }
}

export const search: SearchFunction<
  AlibabaResult,
  MachineTranslatePayload<AlibabaLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    (profile.dicts.all as any).alibaba,
    config,
    payload
  )
  const sourceLanguage = payload.sl || 'auto'

  const auth = (config.dictAuth as any).alibaba || {}
  const accessKeyId = auth.accessKeyId
  const accessKeySecret = auth.accessKeySecret
  if (!accessKeyId || !accessKeySecret) {
    return credentialRequiredResult('alibaba', langcodes)
  }

  try {
    const url = await buildAlibabaSignedUrl({
      accessKeyId,
      accessKeySecret,
      sourceText: text,
      sourceLanguage,
      targetLanguage: tl
    })
    const response = await axios.get(url)
    const parsed = parseAlibabaTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('alibaba', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'alibaba',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sourceLanguage),
      tl,
      slInitial: (profile.dicts.all as any).alibaba.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('alibaba', sl, tl, langcodes)
  }
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}
