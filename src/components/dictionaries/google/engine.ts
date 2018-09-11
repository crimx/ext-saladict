import { handleNoResult, MachineTranslateResult, handleNetWorkError } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainJapanese, isContainKorean } from '@/_helpers/lang-check'
import { first } from '@/_helpers/promise-more'

export type GoogleResult = MachineTranslateResult

interface GoogleRawResult {
  json: string
  base?: string
  tl?: string
  tk1?: number
  tk2?: number
  text: string
}

type GoogleSearchResult = DictSearchResult<GoogleResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<GoogleSearchResult> {
  const options = config.dicts.all.google.options

  const sl = 'auto'
  const tl = options.tl === 'default'
    ? config.langCode === 'en'
      ? 'en'
      : !isContainChinese(text) || isContainJapanese(text) || isContainKorean(text)
        ? config.langCode === 'zh-TW' ? 'zh-TW' : 'zh-CN'
        : 'en'
    : options.tl

  return first([
    fetchWithToken('https://translate.google.com', sl, tl, text),
    fetchWithToken('https://translate.google.cn', sl, tl, text),
  ])
  .catch(() => fetchWithoutToken(sl, tl, text))
  .then(handleText)
}

function fetchWithToken (base: string, sl: string, tl: string, text: string): Promise<GoogleRawResult> {
  return fetch(base)
    .then(r => r.ok ? r.text() : handleNetWorkError())
    .then<GoogleRawResult>(body => {
      const tkk = (body.match(/TKK=(.*?)\(\)\)'\);/) || [''])[0]
        .replace(/\\x([0-9A-Fa-f]{2})/g, '') // remove hex chars
        .match(/[+-]?\d+/g)
      if (tkk) {
        const tk1 = Number(tkk[2])
        const tk2 = Number(tkk[0]) + Number(tkk[1])
        const tk = getTK(text, tk1, tk2)
        if (tk) {
          const encodedText = encodeURIComponent(text)
          return fetch(`${base}/translate_a/single?client=t&sl=${sl}&tl=${tl}&q=${encodedText}&tk=${tk}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=5`)
            .then(r => r.text())
            .then(json => ({ json, base, tl, tk1, tk2, text }))
        }
      }
      return handleNoResult()
    })
}

function fetchWithoutToken (sl: string, tl: string, text: string): Promise<GoogleRawResult> {
  return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`)
    .then(r => r.ok ? r.text() : handleNetWorkError())
    .then(json => ({ json, text }))
}

function handleText (
  { json, base, tl, tk1, tk2, text }: GoogleRawResult
): GoogleSearchResult | Promise<GoogleSearchResult> {
  const data = JSON.parse(json.replace(/,+/g, ','))

  if (!data[0] || data[0].length <= 0) {
    return handleNoResult()
  }

  const transText: string = data[0].map(item => item[0]).join(' ')

  if (transText.length > 0) {
    return {
      result: {
        trans: {
          text: transText,
          audio: tk1 || tk2
            ? `${base}/translate_tts?ie=UTF-8&q=${encodeURIComponent(transText)}&tl=${tl}&total=1&idx=0&tk=${getTK(transText, tk1, tk2)}&client=t`
            : ''
        },
        searchText: {
          text,
          audio: tk1 || tk2
            ? `${base}/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${data[2]}&total=1&idx=0&tk=${getTK(text, tk1, tk2)}&client=t`
            : ''
        }
      }
    }
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
