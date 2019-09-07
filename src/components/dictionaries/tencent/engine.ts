import {
  handleNoResult,
  MachineTranslatePayload,
  MachineTranslateResult,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { storage } from '@/_helpers/browser-api'
import axios from 'axios'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.tencent.options.tl === 'default'
      ? config.langCode === 'zh-CN'
        ? 'zh-CHS'
        : config.langCode === 'zh-TW'
        ? 'zh-CHT'
        : 'en'
      : profile.dicts.all.tencent.options.tl

  return `https://fanyi.tencent.com/#auto/${lang}/${text}`
}

interface TencentToken {
  qtv: string
  qtk: string
}

interface TencentStorage {
  // tencent search token
  token: TencentToken
  // token added date, update the token every day
  tokenDate: number
}

export type TencentResult = MachineTranslateResult<'tencent'>

type TencentSearchResult = DictSearchResult<TencentResult>

// prettier-ignore
const langcodes: ReadonlyArray<string> = [
  'zh', 'en', 'jp', 'kr', 'fr', 'es', 'it',
  'de', 'tr', 'ru', 'pt', 'vi', 'id', 'th', 'ms'
]

let isSetupOriginModifier = false

export const search: SearchFunction<TencentResult, MachineTranslatePayload> = (
  text,
  config,
  profile,
  payload
) => {
  if (!isSetupOriginModifier) {
    setupOriginModifier()
    isSetupOriginModifier = true
  }

  const options = profile.dicts.all.tencent.options

  const sl: string = payload.sl || 'auto'
  const tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode === 'en'
        ? 'en'
        : 'zh'
      : options.tl)

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return (
    getToken()
      .then(({ qtv, qtk }) =>
        axios('https://fanyi.qq.com/api/translate', {
          method: 'post',
          withCredentials: false,
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
          },
          data: new URLSearchParams({
            source: sl,
            target: tl,
            sourceText: text,
            qtv,
            qtk,
            sessionUuid: `translate_uuid${Date.now()}`
          })
        })
      )
      .then(handleJSON)
      // return empty result so that user can still toggle language
      .catch(
        (): TencentSearchResult => ({
          result: {
            id: 'tencent',
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

function handleJSON({
  data: json
}: any): TencentSearchResult | Promise<TencentSearchResult> {
  const tr =
    json &&
    (json.translate as
      | undefined
      | {
          records: Array<{
            sourceText: string
            targetText: string
          }>
          source: string
          target: string
        })
  if (!tr || !tr.records || tr.records.length <= 0) {
    return handleNoResult()
  }

  const sourceText = tr.records.map(r => r.sourceText || '').join('')
  const targetText = tr.records.map(r => r.targetText || '').join('')

  return {
    result: {
      id: 'tencent',
      sl: tr.source,
      tl: tr.target,
      langcodes,
      trans: {
        text: targetText,
        audio: `https://fanyi.qq.com/api/tts?lang=${
          tr.target
        }&text=${encodeURIComponent(targetText)}`
      },
      searchText: {
        text: sourceText,
        audio: `https://fanyi.qq.com/api/tts?lang=${
          tr.source
        }&text=${encodeURIComponent(sourceText)}`
      }
    },
    audio: {
      us: `https://fanyi.qq.com/api/tts?lang=${
        tr.target
      }&text=${encodeURIComponent(targetText)}`
    }
  }
}

async function getToken(): Promise<TencentToken> {
  let { dict_tencent } = await storage.local.get<{
    dict_tencent: TencentStorage
  }>('dict_tencent')
  if (!dict_tencent || Date.now() - dict_tencent.tokenDate > 5 * 60000) {
    const token: TencentToken = {
      qtv: '7942c43f8426b03b',
      qtk:
        'n22E6wF/W+z6bVcH5EVMTOrRyT5dKWhdiw8fKosmYBWvLXuLkGqO8VbMGRmTyMFURB2jz69MyeGwumKYvoaG0P3PufmAr1NB4YlzDayX0/pD7vEr1AZYxrbiZmzms1zheGqDTvVvo8ckartOLA+3aQ=='
    }
    try {
      const homepage = await fetchPlainText('https://fanyi.qq.com')

      const qtv = homepage.match(/"qtv=([^"]+)/)
      if (qtv) {
        token.qtv = qtv[1]
      }

      const qtk = homepage.match(/"qtk=([^"]+)/)
      if (qtk) {
        token.qtk = qtk[1]
      }
    } catch (e) {
      /* nothing */
    }
    dict_tencent = {
      token,
      tokenDate: Date.now()
    }
    storage.local.set({ dict_tencent })
  }

  return dict_tencent.token
}

function setupOriginModifier() {
  browser.webRequest.onBeforeSendHeaders.addListener(
    details => {
      if (details && details.requestHeaders) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Origin') {
            details.requestHeaders[i].value = 'https://fanyi.qq.com'
          }
        }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: ['https://fanyi.qq.com/api/translate'] },
    ['blocking', 'requestHeaders']
  )
}
