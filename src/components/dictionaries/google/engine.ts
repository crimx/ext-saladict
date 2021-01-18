import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Google } from '@opentranslate/google'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { GoogleLanguage } from './config'

export const getTranslator = memoizeOne(() => new Google({ env: 'ext' }))

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const domain = profile.dicts.all.google.options.cnfirst ? 'cn' : 'com'
  const lang =
    profile.dicts.all.google.options.tl === 'default'
      ? config.langCode
      : profile.dicts.all.google.options.tl

  return `https://translate.google.${domain}/#auto/${lang}/${text}`
}

export type GoogleResult = MachineTranslateResult<'google'>

export const search: SearchFunction<
  GoogleResult,
  MachineTranslatePayload<GoogleLanguage>
> = async (rawText, config, profile, payload) => {
  const options = profile.dicts.all.google.options

  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.google,
    config,
    payload
  )

  try {
    const result = await translator.translate(text, sl, tl, {
      token: process.env.GOOGLE_TOKEN || '',
      concurrent: options.concurrent,
      order: options.cnfirst ? ['cn', 'com'] : ['com', 'cn'],
      apiAsFallback: true
    })
    return machineResult(
      {
        result: {
          id: 'google',
          sl: result.from,
          tl: result.to,
          slInitial: profile.dicts.all.google.options.slInitial,
          searchText: result.origin,
          trans: result.trans
        },
        audio: {
          py: result.trans.tts,
          us: result.trans.tts
        }
      },
      translator.getSupportLanguages()
    )
  } catch (e) {
    return machineResult(
      {
        result: {
          id: 'google',
          sl,
          tl,
          slInitial: 'hide',
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] }
        }
      },
      translator.getSupportLanguages()
    )
  }
}
