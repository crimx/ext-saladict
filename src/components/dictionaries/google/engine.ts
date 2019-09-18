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
import { first } from '@/_helpers/promise-more'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const domain = profile.dicts.all.google.options.cnfirst ? 'cn' : 'com'
  const lang =
    profile.dicts.all.google.options.tl === 'default'
      ? config.langCode
      : profile.dicts.all.google.options.tl

  return `https://translate.google.${domain}/#auto/${lang}/${text}`
}

export type GoogleResult = MachineTranslateResult<'google'>

interface GoogleRawResult {
  json: string
  base: string
  sl: string
  tl: string
  tk1?: number
  tk2?: number
  text: string
}

type GoogleSearchResult = DictSearchResult<GoogleResult>

// prettier-ignore
const langcodes: ReadonlyArray<string> = [
  'zh-CN', 'zh-TW', 'en',
  'af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'bs', 'ca', 'ceb', 'co', 'cs', 'cy', 'da', 'de',
  'el', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'fy', 'ga', 'gd', 'gl', 'gu', 'ha', 'haw',
  'he', 'hi', 'hmn', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'ja', 'jw', 'ka', 'kk',
  'km', 'kn', 'ko', 'ku', 'ky', 'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn',
  'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'ny', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'sd',
  'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg',
  'th', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'xh', 'yi', 'yo', 'zu',
]

export const search: SearchFunction<GoogleResult, MachineTranslatePayload> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.google.options

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
          ? 'zh-TW'
          : 'zh-CN'
        : 'en'
      : options.tl)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return (
    first([
      fetchWithToken('https://translate.google.com', sl, tl, text),
      fetchWithToken('https://translate.google.cn', sl, tl, text)
    ])
      .catch(() => fetchWithoutToken(sl, tl, text))
      .then(handleText)
      // return empty result so that user can still toggle language
      .catch(
        (): GoogleSearchResult => ({
          result: {
            id: 'google',
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

async function fetchWithToken(
  base: string,
  sl: string,
  tl: string,
  text: string
): Promise<GoogleRawResult> {
  const homepage = await fetchPlainText(base).catch(handleNetWorkError)

  if (!homepage) {
    handleNetWorkError()
  }

  let tk = ''
  let tk1 = 0
  let tk2 = 0

  // eval version
  let tkk = (homepage.match(/TKK=(.*?)\(\)\)'\);/i) || [''])[0]
    .replace(/\\x([0-9A-Fa-f]{2})/g, '') // remove hex chars
    .match(/[+-]?\d+/g)
  if (tkk) {
    tk1 = Number(tkk[2])
    tk2 = Number(tkk[0]) + Number(tkk[1])
    tk = getTK(text, tk1, tk2)
  }

  // direct number
  if (!tk) {
    tkk = homepage.match(/TKK[=:]['"](\d+?)\.(\d+?)['"]/i)
    if (tkk) {
      tk1 = Number(tkk[1])
      tk2 = Number(tkk[2])
      tk = getTK(text, tk1, tk2)
    }
  }

  if (tk) {
    const json = await fetchPlainText(`${base}/translate_a/single`, {
      params: new URLSearchParams([
        ['client', 'webapp'],
        ['sl', sl],
        ['tl', tl],
        ['hl', 'en'],
        ['dt', 'at'],
        ['dt', 'bd'],
        ['dt', 'ex'],
        ['dt', 'ld'],
        ['dt', 'md'],
        ['dt', 'qca'],
        ['dt', 'rw'],
        ['dt', 'rm'],
        ['dt', 'ss'],
        ['dt', 't'],
        ['source', 'bh'],
        ['ssel', '0'],
        ['tsel', '0'],
        ['kc', '1'],
        ['tk', tk],
        ['q', text]
      ])
    })

    return { json, base, sl, tl, tk1, tk2, text }
  }

  return handleNoResult()
}

async function fetchWithoutToken(
  sl: string,
  tl: string,
  text: string
): Promise<GoogleRawResult> {
  const json = await fetchPlainText(
    'https://translate.googleapis.com/translate_a/single',
    {
      params: new URLSearchParams({
        client: 'gtx',
        dt: 't',
        sl,
        tl,
        q: text
      })
    }
  ).catch(handleNetWorkError)

  return { json, base: 'https://translate.google.cn', sl, tl, text }
}

function handleText({
  json,
  base,
  sl,
  tl,
  tk1,
  tk2,
  text
}: GoogleRawResult): GoogleSearchResult | Promise<GoogleSearchResult> {
  const data = JSON.parse(json.replace(/,+/g, ','))

  if (!data[0] || data[0].length <= 0) {
    return handleNoResult()
  }

  const transText: string = data[0]
    .map(item => item[0])
    .filter(Boolean)
    .join(' ')

  if (transText.length > 0) {
    const transAudio =
      tk1 && tk2 ? getAudioLink(base, transText, tl, tk1, tk2) : ''
    return {
      result: {
        id: 'google',
        sl,
        tl,
        langcodes,
        trans: {
          text: transText,
          audio: transAudio
        },
        searchText: {
          text,
          audio: tk1 && tk2 ? getAudioLink(base, text, data[2], tk1, tk2) : ''
        }
      },
      audio: {
        us: transAudio
      }
    }
  }

  return handleNoResult()
}

function getAudioLink(
  base: string,
  text: string,
  tl: string,
  tk1: number,
  tk2: number
) {
  const url = new URL(`${base}/translate_tts?ie=UTF-8&total=1&idx=0&client=t`)
  url.searchParams.append('q', text)
  url.searchParams.append('tl', tl)
  url.searchParams.append('tk', getTK(text, tk1, tk2))
  return url.toString()
}

/* eslint-disable */
// prettier-ignore
function getTK (a, b, c) {
  b = Number(b) || 0
  let e: any = []
  let f = 0
  let g = 0
  for (; g < a.length; g++) {
    let l = a.charCodeAt(g)
    128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
      e[f++] = l >> 18 | 240,
      e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
      e[f++] = l >> 6 & 63 | 128),
      e[f++] = l & 63 | 128)
  }
  a = b
  for (f = 0; f < e.length; f++) {
    a += e[f], a = _magic(a, '+-a^+6')
  }
  a = _magic(a, '+-3^+b+-f')
  a ^= Number(c) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648)
  a %= 1E6
  return (a.toString() + '.' + (a ^ b))
}

// prettier-ignore
function _magic (a, b) {
  for (var c = 0; c < b.length - 2; c += 3) {
    // @ts-ignore
    var d = b.charAt(c + 2), d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d), d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
    a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
  }
  return a
}

/* eslint-enable */
