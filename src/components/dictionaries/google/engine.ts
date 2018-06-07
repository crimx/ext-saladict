import { handleNoResult } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'

export type GoogleResult = string

type GoogleSearchResult = DictSearchResult<GoogleResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<GoogleSearchResult> {
  const options = config.dicts.all.google.options
  const chCode = config.langCode === 'zh-TW' ? 'zh-TW' : 'zh-CN'
  let sl = 'auto'
  let tl = chCode
  if (isContainChinese(text)) {
    sl = chCode
    tl = 'en'
  } else if (isContainEnglish(text)) {
    sl = 'en'
    tl = chCode
  }

  if (options.cnfirst) {
    return fetchWithToken('https://translate.google.cn', sl, tl, text)
      .catch(() => fetchWithToken('https://translate.google.com', sl, tl, text))
      .catch(() => fetchWithoutToken(sl, tl, text))
  } else {
    return fetchWithToken('https://translate.google.com', sl, tl, text)
      .catch(() => fetchWithToken('https://translate.google.cn', sl, tl, text))
      .catch(() => fetchWithoutToken(sl, tl, text))
  }
}

function fetchWithToken (base: string, sl: string, tl: string, text: string): Promise<GoogleSearchResult> {
  return fetch(base)
    .then(r => r.text())
    .then<Response>(body => {
      const tkk = (body.match(/TKK=(.*?)\(\)\)'\);/) || [''])[0]
        .replace(/\\x([0-9A-Fa-f]{2})/g, '') // remove hex chars
        .match(/[+-]?\d+/g)
      if (tkk) {
        const tk = getTK(text, Number(tkk[2]), (Number(tkk[0]) + Number(tkk[1])))
        if (tk) {
          return fetch(`${base}/translate_a/single?client=t&sl=${sl}&tl=${tl}&q=${text}&tk=${tk}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=5`)
        }
      }
      return handleNoResult()
    })
    .then(r => r.text())
    .then(handleText)
}

function fetchWithoutToken (sl: string, tl: string, text: string): Promise<GoogleSearchResult> {
  return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${text}`)
    .then(r => r.text())
    .then(handleText)
}

function handleText (
  text: string
): GoogleSearchResult | Promise<GoogleSearchResult> {
  const json = JSON.parse(text.replace(/,+/g, ','))

  if (!json[0] || json[0].length <= 0) {
    return handleNoResult()
  }

  const result: string = json[0].map(item => item[0]).join(' ')

  if (result.length > 0) {
    return { result }
  }

  return handleNoResult()
}

/* tslint:disable */

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

function _magic (a, b) {
  for (var c = 0; c < b.length - 2; c += 3) {
    // @ts-ignore
    var d = b.charAt(c + 2), d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d), d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
    a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
  }
  return a
}

/* tslint:enable */
