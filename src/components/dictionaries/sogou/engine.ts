import {
  handleNoResult,
  MachineTranslatePayload,
  MachineTranslateResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainJapanese, isContainKorean } from '@/_helpers/lang-check'
import { storage } from '@/_helpers/browser-api'
import md5 from 'md5'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang = profile.dicts.all.sogou.options.tl === 'default'
    ? config.langCode === 'zh-CN'
      ? 'zh-CHS'
      : config.langCode === 'zh-TW'
        ? 'zh-CHT'
        : 'en'
    : profile.dicts.all.sogou.options.tl

  return `https://fanyi.sogou.com/#auto/${lang}/${text}`
}

interface SogouStorage {
  // sogou search token
  token: string
  // token added date, update the token every day
  tokenDate: number
}

export type SogouResult = MachineTranslateResult

type SogouSearchResult = DictSearchResult<SogouResult>

const langcodes: ReadonlyArray<string> = [
  'zh-CHS', 'zh-CHT', 'en',
  'af', 'ar', 'bg', 'bn', 'bs-Latn', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'es', 'et',
  'fa', 'fi', 'fil', 'fj', 'fr', 'he', 'hi', 'hr', 'ht', 'hu', 'id', 'it', 'ja', 'ko',
  'lt', 'lv', 'mg', 'ms', 'mt', 'mww', 'nl', 'no', 'otq', 'pl', 'pt', 'ro', 'ru', 'sk',
  'sl', 'sm', 'sr-Cyrl', 'sr-Latn', 'sv', 'sw', 'th', 'tlh', 'tlh-Qaak', 'to', 'tr', 'ty',
  'uk', 'ur', 'vi', 'yua', 'yue',
]

export const search: SearchFunction<SogouSearchResult, MachineTranslatePayload> = async (
  text, config, profile, payload
) => {
  const options = profile.dicts.all.sogou.options

  const sl: string = payload.sl || 'auto'
  const tl: string = payload.tl || (
    options.tl === 'default'
      ? config.langCode === 'en'
        ? 'en'
        : !isContainChinese(text) || isContainJapanese(text) || isContainKorean(text)
          ? config.langCode === 'zh-TW' ? 'zh-CHT' : 'zh-CHS'
          : 'en'
      : options.tl
  )

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return fetch('https://fanyi.sogou.com/reventondc/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: `from=${sl}&to=${tl}&text=${encodeURIComponent(text).replace(/%20/g, '+')}&uuid=${getUUID()}&s=${md5('' + sl + tl + text + await getSogouToken())}&client=pc&fr=browser_pc&useDetect=on&useDetectResult=on&needQc=1&oxford=on&isReturnSugg=on`
  })
  .then(r => r.json())
  .catch(handleNetWorkError)
  .then(json => handleJSON(json, sl, tl))
}

function handleJSON (json: any, sl: string, tl: string): SogouSearchResult | Promise<SogouSearchResult> {
  const tr = json.translate as undefined | {
    errorCode: string // "0"
    from: string
    to: string
    text: string
    dit: string
  }
  if (!tr || tr.errorCode !== '0') {
    return handleNoResult()
  }

  return {
    result: {
      id: 'sogou',
      sl, tl, langcodes,
      trans: {
        text: tr.dit,
        audio: tr.to === 'zh-CHT'
          ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.dit)}&spokenDialect=zh-CHT&from=translateweb`
          : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.dit)}&speed=1&lang=${tr.to}&from=translateweb`
      },
      searchText: {
        text: tr.text,
        audio: tr.from === 'zh-CHT'
        ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.text)}&spokenDialect=zh-CHT&from=translateweb`
        : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.text)}&speed=1&lang=${tr.from}&from=translateweb`
      }
    }
  }
}

function getUUID () {
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    const digit = (16 * Math.random()) | 0
    uuid += (i === 12 ? 4 : i === 16 ? (3 & digit) | 8 : digit).toString(16)
  }
  return uuid
}

async function getSogouToken (): Promise<string> {
  let { dict_sogou } = await storage.local.get<{'dict_sogou': SogouStorage}>('dict_sogou')
  if (!dict_sogou || (Date.now() - dict_sogou.tokenDate > 5 * 60000)) {
    let token = '72da1dc662daf182c4f7671ec884074b'
    try {
      const homepage = await fetch('https://fanyi.sogou.com').then(r => r.text())

      const appjsMatcher = /dlweb\.sogoucdn\.com\/translate\/pc\/static\/js\/app\.\S+\.js/
      const appjsPath = (homepage.match(appjsMatcher) || [''])[0]
      if (appjsPath) {
        const appjs = await fetch('https://' + appjsPath).then(r => r.text())
        const matchRes = appjs.match(/"(\w{32})"/)
        if (matchRes) {
          token = matchRes[1]
        }
      }
    } catch (e) {/* nothing */}
    dict_sogou = {
      token,
      tokenDate: Date.now()
    }
    storage.local.set({ dict_sogou })
  }

  return dict_sogou.token
}
