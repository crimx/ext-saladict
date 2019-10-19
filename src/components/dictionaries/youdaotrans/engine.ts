import {
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  getMachineTranslateTl
} from '../helpers'
import { Youdao } from '@opentranslate/youdao'
import { YoudaotransLanguage } from './config'

let _translator: Youdao | undefined
const getTranslator = () =>
  (_translator = _translator || new Youdao({ env: 'ext' }))

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return `http://fanyi.youdao.com`
}

export type YoudaotransResult = MachineTranslateResult<'youdaotrans'>

export const search: SearchFunction<
  YoudaotransResult,
  MachineTranslatePayload<YoudaotransLanguage>
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.youdaotrans.options

  const translator = getTranslator()

  const sl = payload.sl || (await translator.detect(text))
  const tl = getMachineTranslateTl(sl, options.tl, config)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  try {
    const result = await translator.translate(text, sl, tl)
    return {
      result: {
        id: 'youdaotrans',
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
        id: 'youdaotrans',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
