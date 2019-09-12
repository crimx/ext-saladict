import {
  handleNoResult,
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainJapanese, isContainKorean } from '@/_helpers/lang-check'
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

export type SogouResult = MachineTranslateResult<'sogou'>

type SogouSearchResult = DictSearchResult<SogouResult>

const langcodes: ReadonlyArray<string> = [
  'zh-CHS', 'zh-CHT', 'en',
  'af', 'ar', 'bg', 'bn', 'bs-Latn', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'es', 'et',
  'fa', 'fi', 'fil', 'fj', 'fr', 'he', 'hi', 'hr', 'ht', 'hu', 'id', 'it', 'ja', 'ko',
  'lt', 'lv', 'mg', 'ms', 'mt', 'mww', 'nl', 'no', 'otq', 'pl', 'pt', 'ro', 'ru', 'sk',
  'sl', 'sm', 'sr-Cyrl', 'sr-Latn', 'sv', 'sw', 'th', 'tlh', 'tlh-Qaak', 'to', 'tr', 'ty',
  'uk', 'ur', 'vi', 'yua', 'yue',
]

let isSetupHeaderModifier = false

export const search: SearchFunction<SogouSearchResult, MachineTranslatePayload> = async (
  text, config, profile, payload
) => {
  if (!isSetupHeaderModifier) {
    setupHeaderModifier()
    isSetupHeaderModifier = true
  }

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

  return fetch('https://fanyi.sogou.com/reventondc/translateV2', {
    method: 'POST',
    headers: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      from: sl,
      to: tl,
      text: text,
      client: 'pc',
      fr: 'browser_pc',
      pid: 'sogou-dict-vr',
      dict: 'true',
      word_group: 'true',
      second_query: 'true',
      uuid: getUUID(),
      needQc: '1',
      s: md5('' + sl + tl + text + (await getSogouToken()))
    }).toString()
  })
  .then(r => r.json())
  .then(json => handleJSON(json, sl, tl))
  // return empty result so that user can still toggle language
  .catch((): SogouSearchResult => ({
    result: {
      id: 'sogou',
      sl, tl, langcodes,
      searchText: { text: '' },
      trans: { text: '' }
    }
  }))
}

function handleJSON (json: any, sl: string, tl: string): SogouSearchResult | Promise<SogouSearchResult> {
  const tr = json.data ? json.data.translate : json.translate as undefined | {
    errorCode: string // "0"
    from: string
    to: string
    text: string
    dit: string
  }
  if (!tr || tr.errorCode !== '0') {
    return handleNoResult()
  }

  const transAudio = tr.to === 'zh-CHT'
    ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.dit)}&spokenDialect=zh-CHT&from=translateweb`
    : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.dit)}&speed=1&lang=${tr.to}&from=translateweb`

  return {
    result: {
      id: 'sogou',
      sl, tl, langcodes,
      trans: {
        text: tr.dit,
        audio: transAudio
      },
      searchText: {
        text: tr.text,
        audio: tr.from === 'zh-CHT'
        ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.text)}&spokenDialect=zh-CHT&from=translateweb`
        : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.text)}&speed=1&lang=${tr.from}&from=translateweb`
      }
    },
    audio: {
      us: transAudio
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
  // let { dict_sogou } = await storage.local.get<{'dict_sogou': SogouStorage}>('dict_sogou')
  // if (!dict_sogou || (Date.now() - dict_sogou.tokenDate > 5 * 60000)) {
  //   let token = '72da1dc662daf182c4f7671ec884074b'
  //   try {
  //     const homepage = await fetch('https://fanyi.sogou.com').then(r => r.text())

  //     const appjsMatcher = /dlweb\.sogoucdn\.com\/translate\/pc\/static\/js\/app\.\S+\.js/
  //     const appjsPath = (homepage.match(appjsMatcher) || [''])[0]
  //     if (appjsPath) {
  //       const appjs = await fetch('https://' + appjsPath).then(r => r.text())
  //       const matchRes = appjs.match(/"(\w{32})"/)
  //       if (matchRes) {
  //         token = matchRes[1]
  //       }
  //     }
  //   } catch (e) {/* nothing */}
  //   dict_sogou = {
  //     token,
  //     tokenDate: Date.now()
  //   }
  //   storage.local.set({ dict_sogou })
  // }

  // return dict_sogou.token
  return '8511813095151'
}

function setupHeaderModifier() {
  const extraInfoSpec = ['blocking', 'requestHeaders']
  // https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
  if (
    browser.webRequest['OnBeforeSendHeadersOptions'] &&
    browser.webRequest['OnBeforeSendHeadersOptions'].hasOwnProperty(
      'EXTRA_HEADERS'
    )
  ) {
    extraInfoSpec.push('extraHeaders')
  }

  browser.webRequest.onBeforeSendHeaders.addListener(
    details => {
      if (details && details.requestHeaders) {
        const headers = details.requestHeaders.filter(
          header => !/^(Origin|Referer|Host)$/.test(header.name)
        )

        headers.push(
          { name: 'Origin', value: 'https://fanyi.sogou.com' },
          { name: 'Referer', value: 'https://fanyi.sogou.com/' },
          { name: 'Host', value: 'fanyi.sogou.com' }
        )

        return { requestHeaders: headers }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: ['https://fanyi.sogou.com/reventondc/translateV2'] },
    extraInfoSpec as any
  )
}
