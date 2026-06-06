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
import { NiuTransLanguage } from './config'

export const NIUTRANS_ENDPOINT =
  'https://api.niutrans.com/NiuTransServer/translation'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<NiuTransLanguage>(
    commonMachineLanguages as ReadonlyArray<NiuTransLanguage>
  )
)

export const getSrcPage: GetSrcPageFunction = () => 'https://niutrans.com/trans'

export type NiuTransResult = MachineTranslateResult<any>

export function mapNiuTransLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'cht'
    default:
      return lang
  }
}

export function buildNiuTransPayload(input: {
  apikey: string
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
}): string {
  const params = new URLSearchParams()
  params.set('from', mapNiuTransLanguage(input.sourceLanguage))
  params.set('to', mapNiuTransLanguage(input.targetLanguage))
  params.set('apikey', input.apikey)
  params.set('src_text', input.sourceText)
  return params.toString()
}

export function parseNiuTransTranslatedText(data: any): {
  translatedText: string
  detectedLanguage?: string
} {
  return {
    translatedText:
      data?.tgt_text ||
      data?.tgtText ||
      data?.translation ||
      data?.translated ||
      '',
    detectedLanguage: data?.from || data?.sourceLanguage || data?.detectedLanguage
  }
}

export const search: SearchFunction<
  NiuTransResult,
  MachineTranslatePayload<NiuTransLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    (profile.dicts.all as any).niutrans,
    config,
    payload
  )

  const auth = (config.dictAuth as any).niutrans || {}
  const apikey = auth.apikey
  if (!apikey) {
    return credentialRequiredResult('niutrans', langcodes)
  }

  try {
    const response = await axios.post(
      NIUTRANS_ENDPOINT,
      buildNiuTransPayload({
        apikey,
        sourceText: text,
        sourceLanguage: sl,
        targetLanguage: tl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    const parsed = parseNiuTransTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('niutrans', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'niutrans',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sl),
      tl,
      slInitial: (profile.dicts.all as any).niutrans.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('niutrans', sl, tl, langcodes)
  }
}
