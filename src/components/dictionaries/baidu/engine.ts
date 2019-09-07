import axios from 'axios'
import {
  handleNoResult,
  MachineTranslateResult,
  handleNetWorkError,
  SearchFunction,
  MachineTranslatePayload,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import {
  isContainChinese,
  isContainJapanese,
  isContainKorean
} from '@/_helpers/lang-check'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.baidu.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh'
        : config.langCode === 'zh-TW'
        ? 'cht'
        : 'en'
      : profile.dicts.all.baidu.options.tl

  return `https://fanyi.baidu.com/#auto/${lang}/${text}`
}

export type BaiduResult = MachineTranslateResult<'baidu'>

interface BaiduRawResult {
  error?: number

  trans_result: {
    from: string
    to: string
    data: Array<{
      src: string
      dst: string
    }>
  }
}

// prettier-ignore
const langcodes: ReadonlyArray<string> = [
  'zh', 'cht', 'en',
  'af', 'am', 'ara', 'az', 'be', 'bn', 'bs', 'bul', 'ca', 'cs', 'cy',
  'dan', 'de', 'el', 'eo', 'est', 'eu', 'fa', 'fin', 'fra', 'ga', 'gl', 'gu',
  'ha', 'hi', 'hr', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'iw', 'jp',
  'ka', 'kk', 'kn', 'kor', 'ky', 'lb', 'lt', 'lv', 'mi', 'mk', 'mr', 'ms', 'mt',
  'ne', 'nl', 'no', 'pa', 'pl', 'pt', 'pt_BR', 'rom', 'ru',
  'si', 'sk', 'slo', 'spa', 'sq', 'sr', 'sw', 'swe',
  'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'uz', 'vie', 'wyw', 'yo', 'yue', 'zu',
]

type BaiduSearchResult = DictSearchResult<BaiduResult>

const headers =
  process.env.NODE_ENV === 'test'
    ? { cookie: 'BAIDUID=8971CB398A02E6B27F50DFF1DE3164BF:FG=1;' }
    : {}

export const search: SearchFunction<
  BaiduResult,
  MachineTranslatePayload
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.baidu.options

  let sl: string = payload.sl || (await remoteLangCheck(text))
  const tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode === 'en'
        ? 'en'
        : !isContainChinese(text) ||
          isContainJapanese(text) ||
          isContainKorean(text)
        ? config.langCode === 'zh-TW'
          ? 'cht'
          : 'zh'
        : 'en'
      : options.tl)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return (
    getToken()
      .then(({ gtk, token }) =>
        axios('https://fanyi.baidu.com/v2transapi', {
          method: 'post',
          withCredentials: true,
          headers,
          data: new URLSearchParams({
            from: sl,
            to: tl,
            query: encodeURIComponent(text).replace(/%20/g, '+'),
            token: token,
            sign: sign(text, gtk),
            transtype: 'translang',
            simple_means_flag: '3'
          })
        })
      )
      .then(({ data }) => handleJSON(data, sl, tl))
      // return empty result so that user can still toggle language
      .catch(
        (): BaiduSearchResult => ({
          result: {
            id: 'baidu',
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
  json: BaiduRawResult,
  sl: string,
  tl: string
): BaiduSearchResult | Promise<BaiduSearchResult> {
  if (json.error === 998) {
    // missing cookie, fetch again
    return handleNetWorkError()
  }

  if (!json.trans_result) {
    return handleNoResult()
  }

  if (json.trans_result.from) {
    sl = json.trans_result.from
  }

  const transText = json.trans_result.data.map(d => d.dst).join(' ')
  const searchText = json.trans_result.data.map(d => d.src).join(' ')

  return {
    result: {
      id: 'baidu',
      sl,
      tl,
      langcodes,
      trans: {
        text: transText,
        audio: `https://fanyi.baidu.com/gettts?lan=${tl}&text=${encodeURIComponent(
          transText
        )}&spd=3&source=web`
      },
      searchText: {
        text: searchText,
        audio: `https://fanyi.baidu.com/gettts?spd=3&source=web&lan=${sl}&text=${encodeURIComponent(
          searchText
        )}`
      }
    },
    audio: {
      us: `https://fanyi.baidu.com/gettts?spd=3&source=web&lan=${tl}&text=${encodeURIComponent(
        transText
      )}`
    }
  }
}

function remoteLangCheck(text: string): Promise<string> {
  return axios('https://fanyi.baidu.com/langdetect', {
    method: 'post',
    withCredentials: false,
    data: new URLSearchParams({
      query: encodeURIComponent(text)
    })
  })
    .then(({ data }) => (data && data.lan) || Promise.reject(data))
    .catch(() => 'auto')
}

async function getToken(): Promise<{ gtk: string; token: string }> {
  const homepage = await fetchPlainText('https://fanyi.baidu.com', {
    withCredentials: true,
    headers
  })

  return {
    gtk: (/window.gtk = '([^']+)'/.exec(homepage) || ['', ''])[1],
    token: (/token: '([^']+)'/.exec(homepage) || ['', ''])[1]
  }
}

/* eslint-disable */
// prettier-ignore
function sign (text: string, gtk: string) {
  let o = text.length
  o > 30 && (text =
    '' +
    text.substr(0, 10) +
    text.substr(Math.floor(o / 2) - 5, 10) +
    text.substr(-10, 10)
  )
  let t = gtk || ''

  let e = t.split('.')
  let h = Number(e[0]) || 0
  let i = Number(e[1]) || 0
  let d = [] as number[]
  let f = 0
  let g = 0
  for (; g < text.length; g++) {
    let m = text.charCodeAt(g)
    128 > m
      ? (d[f++] = m)
      : (2048 > m
          ? (d[f++] = (m >> 6) | 192)
          : (55296 === (64512 & m) &&
            g + 1 < text.length &&
            56320 === (64512 & text.charCodeAt(g + 1))
              ? ((m =
                  65536 + ((1023 & m) << 10) + (1023 & text.charCodeAt(++g))),
                (d[f++] = (m >> 18) | 240),
                (d[f++] = ((m >> 12) & 63) | 128))
              : (d[f++] = (m >> 12) | 224),
            (d[f++] = ((m >> 6) & 63) | 128)),
        (d[f++] = (63 & m) | 128))
  }

  let S = h
  let u = '+-a^+6'
  let l = '+-3^+b+-f'
  let s = 0
  for (; s < d.length; s++) {
    ;(S += d[s]), (S = a(S, u))
  }
  return (
    (S = a(S, l)),
    (S ^= i),
    0 > S && (S = (2147483647 & S) + 2147483648),
    (S %= 1e6),
    S.toString() + '.' + (S ^ h)
  )

  function a(r: any, o: any) {
    for (let t = 0; t < o.length - 2; t += 3) {
      let a = o.charAt(t + 2)
      ;(a = a >= 'a' ? a.charCodeAt(0) - 87 : Number(a)),
        (a = '+' === o.charAt(t + 1) ? r >>> a : r << a),
        (r = '+' === o.charAt(t) ? (r + a) & 4294967295 : r ^ a)
    }
    return r
  }
}
/* eslint-enable */
