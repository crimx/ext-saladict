import {
  handleNoResult,
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import {
  isContainChinese,
  isContainJapanese,
  isContainKorean
} from '@/_helpers/lang-check'
import { storage } from '@/_helpers/browser-api'
import md5 from 'md5'
import axios from 'axios'

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

interface SogouStorage {
  // sogou search token
  token: string
  // token added date, update the token every day
  tokenDate: number
}

export type SogouResult = MachineTranslateResult<'sogou'>

type SogouSearchResult = DictSearchResult<SogouResult>

// prettier-ignore
const langcodes: ReadonlyArray<string> = [
  'zh-CHS', 'zh-CHT', 'en',
  'af', 'ar', 'bg', 'bn', 'bs-Latn', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'es', 'et',
  'fa', 'fi', 'fil', 'fj', 'fr', 'he', 'hi', 'hr', 'ht', 'hu', 'id', 'it', 'ja', 'ko',
  'lt', 'lv', 'mg', 'ms', 'mt', 'mww', 'nl', 'no', 'otq', 'pl', 'pt', 'ro', 'ru', 'sk',
  'sl', 'sm', 'sr-Cyrl', 'sr-Latn', 'sv', 'sw', 'th', 'tlh', 'tlh-Qaak', 'to', 'tr', 'ty',
  'uk', 'ur', 'vi', 'yua', 'yue',
]

let isSetupHeaderModifier = false

export const search: SearchFunction<
  SogouResult,
  MachineTranslatePayload
> = async (text, config, profile, payload) => {
  if (!isSetupHeaderModifier) {
    setupHeaderModifier()
    isSetupHeaderModifier = true
  }

  const options = profile.dicts.all.sogou.options

  const sl: string = payload.sl || 'auto'
  const tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode === 'en'
        ? 'en'
        : !isContainChinese(text) ||
          isContainJapanese(text) ||
          isContainKorean(text)
        ? config.langCode === 'zh-TW'
          ? 'zh-CHT'
          : 'zh-CHS'
        : 'en'
      : options.tl)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return (
    axios('https://fanyi.sogou.com/reventondc/translateV2', {
      method: 'post',
      headers: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: new URLSearchParams({
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
      })
    })
      .then(({ data: { data } }) => handleJSON(data, sl, tl))
      // return empty result so that user can still toggle language
      .catch(
        (): SogouSearchResult => ({
          result: {
            id: 'sogou',
            sl,
            tl,
            langcodes,
            searchText: { text: '' },
            trans: { text: '' }
          }
        })
      )
  )
}

function handleJSON(
  json: any,
  sl: string,
  tl: string
): SogouSearchResult | Promise<SogouSearchResult> {
  const tr = json.translate as
    | undefined
    | {
        errorCode: string // "0"
        from: string
        to: string
        text: string
        dit: string
      }
  if (!tr || tr.errorCode !== '0') {
    return handleNoResult()
  }

  const trdit = encodeURIComponent(tr.dit)
  const trtext = encodeURIComponent(tr.text)

  const transAudio =
    tr.to === 'zh-CHT'
      ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${trdit}&spokenDialect=zh-CHT&from=translateweb`
      : `https://fanyi.sogou.com/reventondc/synthesis?text=${trdit}&speed=1&lang=${tr.to}&from=translateweb`

  return {
    result: {
      id: 'sogou',
      sl,
      tl,
      langcodes,
      trans: {
        text: tr.dit,
        audio: transAudio
      },
      searchText: {
        text: tr.text,
        audio:
          tr.from === 'zh-CHT'
            ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${trtext}&spokenDialect=zh-CHT&from=translateweb`
            : `https://fanyi.sogou.com/reventondc/synthesis?text=${trtext}&speed=1&lang=${tr.from}&from=translateweb`
      }
    },
    audio: {
      us: transAudio
    }
  }
}

function getUUID() {
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

async function getSogouToken(): Promise<string> {
  let { dict_sogou } = await storage.local.get<{ dict_sogou: SogouStorage }>(
    'dict_sogou'
  )
  if (!dict_sogou || Date.now() - dict_sogou.tokenDate > 6 * 3600000) {
    let token = '8511813095151'
    try {
      const response = await axios.get(
        'https://github.com/crimx/ext-saladict/blob/dev/src/components/dictionaries/sogou/seccode.json'
      )
      if (response.data && response.data.seccode) {
        token = response.data.seccode
      }
    } catch (e) {
      /* nothing */
    }
    dict_sogou = {
      token,
      tokenDate: Date.now()
    }
    storage.local.set({ dict_sogou })
  }

  return dict_sogou.token
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
