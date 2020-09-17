import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import { Sogou } from '@opentranslate/sogou'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { SogouLanguage } from './config'

export const getTranslator = memoizeOne(
  () =>
    new Sogou({
      env: 'ext',
      config:
        process.env.SOGOU_PID && process.env.SOGOU_KEY
          ? {
              pid: process.env.SOGOU_PID,
              key: process.env.SOGOU_KEY
            }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.sogou.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh-CHS'
        : config.langCode === 'zh-TW'
        ? 'zh-CHT'
        : 'en'
      : profile.dicts.all.sogou.options.tl

  return `https://fanyi.sogou.com/#auto/${lang}/${text}`
}

export type SogouResult = MachineTranslateResult<'sogou'>

export const search: SearchFunction<
  SogouResult,
  MachineTranslatePayload<SogouLanguage>
> = async (rawText, config, profile, payload) => {
  if (!config.dictAuth.sogou.pid) {
    return machineResult(
      {
        result: {
          requireCredential: true,
          id: 'sogou',
          sl: 'auto',
          tl: 'auto',
          slInitial: 'hide',
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] }
        }
      },
      []
    )
  }

  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.sogou,
    config,
    payload
  )

  const translatorConfig = {
    pid: config.dictAuth.sogou.pid,
    key: config.dictAuth.sogou.key
  }

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return machineResult(
      {
        result: {
          id: 'sogou',
          sl: result.from,
          tl: result.to,
          slInitial: profile.dicts.all.sogou.options.slInitial,
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
          id: 'sogou',
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
