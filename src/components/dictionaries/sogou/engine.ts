import {
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  getMachineTranslateTl
} from '../helpers'
import { Sogou } from '@opentranslate/sogou'
import { SogouLanguage } from './config'

let _translator: Sogou | undefined
const getTranslator = () =>
  (_translator = _translator || new Sogou({ env: 'ext' }))

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
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.sogou.options

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
        id: 'sogou',
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
        id: 'sogou',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
