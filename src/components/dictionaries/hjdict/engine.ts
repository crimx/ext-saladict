import {
  isContainChinese,
  isContainEnglish,
  isContainJapanese,
  isContainKorean,
  isContainFrench,
  isContainDeutsch,
  isContainSpanish
} from '@/_helpers/lang-check'
import {
  HTMLString,
  getInnerHTML,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { DictConfigs } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { getStaticSpeaker } from '@/components/Speaker'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return `${HOST}/${getLangCode(text, profile)}/${encodeURIComponent(text)}`
}

const HOST = 'https://dict.hujiang.com'

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

export const search: SearchFunction<HjdictResult, HjdictPayload> = async (
  text,
  config,
  profile,
  payload
) => {
  const langCode = payload.langCode || getLangCode(text, profile)

  return fetchDirtyDOM(
    `https://dict.hujiang.com/${langCode}/${encodeURIComponent(text)}`,
    {
      withCredentials: true
    }
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, profile.dicts.all.hjdict.options, langCode))
}

function handleDOM(
  doc: Document,
  options: DictConfigs['hjdict']['options'],
  langCode: string
): HjdictSearchResult | Promise<HjdictSearchResult> {
  if (doc.querySelector('.word-notfound')) {
    return wrapNoResult(langCode)
  }

  const $suggests = doc.querySelector('.word-suggestions')
  if ($suggests) {
    if (options.related) {
      return {
        result: {
          type: 'related',
          langCode,
          content: getInnerHTML(HOST, $suggests)
        }
      }
    }
    return wrapNoResult(langCode)
  }

  let header = ''
  const $header = doc.querySelector('.word-details-multi .word-details-header')
  if ($header) {
    $header
      .querySelectorAll<HTMLLIElement>('.word-details-tab')
      .forEach(($tab, i) => {
        $tab.dataset.categories = String(i)
      })
    header = getInnerHTML(HOST, $header)
  }

  doc.querySelectorAll<HTMLSpanElement>('.word-audio').forEach($audio => {
    $audio.replaceWith(getStaticSpeaker($audio.dataset.src))
  })

  const entries: HTMLString[] = [
    ...doc.querySelectorAll('.word-details-pane')
  ].map(
    ($pane, i) => `
      <div class="word-details-pane${
        i === 0 ? ' word-details-pane-active' : ''
      }">
        <div class="word-details-pane-header">
          ${getInnerHTML(HOST, $pane, '.word-details-pane-header')}
        </div>
        <div class="word-details-pane-content">
          ${getInnerHTML(HOST, $pane, '.word-details-pane-content')}
        </div>
      </div>
    `
  )

  return entries.length > 0
    ? { result: { type: 'lex', header, entries, langCode } }
    : wrapNoResult(langCode)
}

function wrapNoResult(langCode: string): DictSearchResult<HjdictResultRelated> {
  return {
    result: {
      type: 'related',
      langCode,
      content: '<p style="text-align:center;">No Result</p>'
    }
  }
}

/**
 * Firefox adds 'Origin' field with `fetch` which would be rejected by the server.
 */
// function xhrDirtyDOM (url: string): Promise<Document> {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest()
//     xhr.open('GET', url, true)
//     xhr.responseType = 'document'
//     xhr.withCredentials = true
//     xhr.onload = () => {
//       if (xhr.readyState === xhr.DONE && xhr.status >= 200 && xhr.status < 300) {
//         if (xhr.responseXML) {
//           resolve(xhr.responseXML)
//         } else {
//           reject(xhr)
//         }
//       }
//     }
//     xhr.onerror = err => reject(err)
//     xhr.send(null)
//   })
// }

function getLangCode(text: string, profile: Profile): string {
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
