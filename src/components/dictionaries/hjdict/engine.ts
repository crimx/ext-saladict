import {
  isContainChinese,
  isContainEnglish,
  isContainJapanese,
  isContainKorean,
  isContainFrench,
  isContainDeutsch,
  isContainSpanish,
} from '@/_helpers/lang-check'
import {
  HTMLString,
  getInnerHTMLBuilder,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { getStaticSpeakerHTML } from '@/components/withStaticSpeaker'
import { DictSearchResult } from '@/typings/server'
import { DictConfigs } from '@/app-config'
import { Profile } from '@/app-config/profiles'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return `https://www.hjdict.com/${getLangCode(text, profile)}/${encodeURIComponent(text)}`
}

const getInnerHTML = getInnerHTMLBuilder('https://www.hjdict.com/', {})

export interface HjdictResultLex {
  type: 'lex'
  langCode: string
  header?: HTMLString
  entries: HTMLString[]
}

export interface HjdictResultRelated {
  type: 'related'
  langCode: string
  content: HTMLString
}

export type HjdictResult = HjdictResultLex | HjdictResultRelated

type HjdictSearchResult = DictSearchResult<HjdictResult>

interface HjdictPayload {
  langCode?: string
}

export const search: SearchFunction<HjdictSearchResult, HjdictPayload> = async (
  text, config, profile, payload
) => {
  const cookies = {
    HJ_SITEID: 3,
    HJ_UID: getUUID(),
    HJ_SID: getUUID(),
    HJ_SSID: getUUID(),
    HJID: 0,
    HJ_VT: 2,
    HJ_SST: 1,
    HJ_CSST: 1,
    HJ_ST: 1,
    HJ_CST: 1,
    HJ_T: +new Date(),
    _: getUUID(16),
  }

  await Promise.all(Object.keys(cookies).map(name =>
    browser.cookies.set({
      url: 'https://www.hjdict.com',
      domain: 'hjdict.com',
      name,
      value: String(cookies[name]),
    })
  ))

  const langCode = payload.langCode || getLangCode(text, profile)

  return xhrDirtyDOM(
    `https://www.hjdict.com/${langCode}/${encodeURIComponent(text)}`
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, profile.dicts.all.hjdict.options, langCode))
}

function handleDOM (
  doc: Document,
  options: DictConfigs['hjdict']['options'],
  langCode: string,
): HjdictSearchResult | Promise<HjdictSearchResult> {
  if (doc.querySelector('.word-notfound')) {
    return handleNoResult()
  }

  const $suggests = doc.querySelector('.word-suggestions')
  if ($suggests) {
    if (options.related) {
      return {
        result: {
          type: 'related',
          langCode,
          content: getInnerHTML($suggests),
        }
      }
    }
    return handleNoResult()
  }

  let header = ''
  const $header = doc.querySelector('.word-details-multi .word-details-header')
  if ($header) {
    $header.querySelectorAll<HTMLLIElement>('.word-details-tab').forEach(($tab, i) => {
      $tab.dataset.categories = String(i)
    })
    header = getInnerHTML($header)
  }

  doc.querySelectorAll<HTMLSpanElement>('.word-audio').forEach($audio => {
    $audio.outerHTML = getStaticSpeakerHTML($audio.dataset.src)
  })

  const entries: HTMLString[] = [...doc.querySelectorAll('.word-details-pane')]
    .map(($pane, i) => (`
      <div class="word-details-pane${i === 0 ? ' word-details-pane-active' : ''}">
        <div class="word-details-pane-header">
          ${getInnerHTML($pane, '.word-details-pane-header')}
        </div>
        <div class="word-details-pane-content">
          ${getInnerHTML($pane, '.word-details-pane-content')}
        </div>
      </div>
    `))

  return entries.length > 0
    ? { result: { type: 'lex', header, entries, langCode } }
    : handleNoResult()
}

/**
 * Firefox adds 'Origin' field with `fetch` which would be rejected by the server.
 */
function xhrDirtyDOM (url: string): Promise<Document> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'document'
    xhr.withCredentials = true
    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE && xhr.status >= 200 && xhr.status < 300) {
        if (xhr.responseXML) {
          resolve(xhr.responseXML)
        } else {
          reject(xhr)
        }
      }
    }
    xhr.onerror = err => reject(err)
    xhr.send(null)
  })
}

function getLangCode (text: string, profile: Profile): string {
  // ü
  if (/\u00fc/i.test(text)) {
    return profile.dicts.all.hjdict.options.uas
  }

  // ä
  if (/\u00e4/i.test(text)) {
    return profile.dicts.all.hjdict.options.aas
  }

  // é
  if (/\u00e9/i.test(text)) {
    return profile.dicts.all.hjdict.options.eas
  }

  if (isContainFrench(text)) {
    return 'fr'
  }

  if (isContainDeutsch(text)) {
    return 'de'
  }

  if (isContainSpanish(text)) {
    return 'es'
  }

  if (isContainEnglish(text)) {
    return profile.dicts.all.hjdict.options.engas
  }

  if (isContainJapanese(text)) {
    return 'jp/jc'
  }

  if (isContainKorean(text)) {
    return 'kr'
  }

  if (isContainChinese(text)) {
    return profile.dicts.all.hjdict.options.chsas
  }

  return 'w'
}

function getUUID (e?: number): string {
  let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 16
  let n = ''
  if ('number' === typeof e) {
    for (let i = 0; i < e; i++) {
      let r = Math.floor(10 * Math.random())
      n += r % 2 === 0 ? 'x' : 'y'
    }
  } else {
    n = e || 'xxxxxxxx-xyxx-yxxx-xxxy-xxyxxxxxxxxx'
  }
  return ('number' !== typeof t || t < 2 || t > 36) && (t = 16),
    n.replace(/[xy]/g, function (e) {
      let n = Math.random() * t | 0
      return ('x' === e ? n : 3 & n | 8).toString(t)
    })
}
