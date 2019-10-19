import {
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  getMachineTranslateTl
} from '../helpers'
import { Tencent } from '@opentranslate/tencent'
import { TencentLanguage } from './config'

let _translator: Tencent | undefined
const getTranslator = () =>
  (_translator = _translator || new Tencent({ env: 'ext' }))

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.tencent.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh-CHS'
        : config.langCode === 'zh-TW'
        ? 'zh-CHT'
        : 'en'
      : profile.dicts.all.tencent.options.tl

  return `https://fanyi.qq.com/#auto/${lang}/${text}`
}

export type TencentResult = MachineTranslateResult<'tencent'>

export const search: SearchFunction<
  TencentResult,
  MachineTranslatePayload<TencentLanguage>
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.tencent.options

  const translator = getTranslator()

  const sl = payload.sl || (await translator.detect(text))
  const tl = payload.tl || getMachineTranslateTl(sl, options.tl, config)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  try {
    const result = await translator.translate(text, sl, tl)
    return {
      result: {
        id: 'tencent',
        sl: result.from,
        tl: result.to,
        langcodes: translator.getSupportLanguages(),
        searchText: result.origin,
        trans: result.trans
      },
      audio: {
        us: result.trans.tts
      }
    }
  } catch (e) {
    return {
      result: {
        id: 'tencent',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
