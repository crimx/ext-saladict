import {
  MachineTranslateResult,
  SearchFunction,
  MachineTranslatePayload,
  GetSrcPageFunction,
  getMachineTranslateTl
} from '../helpers'
import { isContainChinese, isContainJapanese } from '@/_helpers/lang-check'
import { Caiyun } from '@opentranslate/caiyun'
import { CaiyunLanguage } from './config'

let _translator: Caiyun | undefined
const getTranslator = () =>
  (_translator = _translator || new Caiyun({ env: 'ext' }))

export const getSrcPage: GetSrcPageFunction = () => {
  return 'https://fanyi.caiyunapp.com/'
}

export type CaiyunResult = MachineTranslateResult<'caiyun'>

export const search: SearchFunction<
  CaiyunResult,
  MachineTranslatePayload<CaiyunLanguage>
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.caiyun.options

  const translator = getTranslator()

  let sl = payload.sl || (await translator.detect(text))
  let tl =
    payload.tl || getMachineTranslateTl(sl, profile.dicts.all.caiyun, config)

  if (sl === tl) {
    if (isContainJapanese(text)) {
      sl = 'ja'
      if (tl === 'ja') {
        tl = config.langCode.startsWith('zh') ? 'zh-CN' : 'en'
      }
    } else if (isContainChinese(text)) {
      sl = 'zh-CN'
      if (tl === 'zh-CN') {
        tl = 'en'
      }
    } else {
      sl = 'en'
      if (tl === 'en') {
        tl = 'zh-CN'
      }
    }
  }

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  try {
    const result = await translator.translate(text, sl, tl)
    return {
      result: {
        id: 'caiyun',
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
        id: 'caiyun',
        sl,
        tl,
        langcodes: translator.getSupportLanguages(),
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    }
  }
}
