import {
  isContainChinese,
  isContainEnglish,
  isContainJapanese,
  isContainKorean,
  isContainFrench,
  isContainDeutsch,
  isContainSpanish,
} from '@/_helpers/lang-check'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTMLBuilder,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { AppConfig, DictConfigs } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = (text, config) => {
  return `https://www.hjdict.com/${getLangCode(text, config)}/${encodeURIComponent(text)}`
}

const getInnerHTML = getInnerHTMLBuilder('https://www.hjdict.com/', {})

export interface HjdictResultLex {
  type: 'lex'
  header?: HTMLString
  entries: HTMLString[]
}

export interface HjdictResultRelated {
  type: 'related'
  content: HTMLString
}

export type HjdictResult = HjdictResultLex | HjdictResultRelated

type HjdictSearchResult = DictSearchResult<HjdictResult>

export const search: SearchFunction<HjdictSearchResult> = (
  text, config, payload
) => {
  return fetchDirtyDOM(getSrcPage(text, config))
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, config.dicts.all.hjdict.options))
}

function handleDOM (
  doc: Document,
  options: DictConfigs['hjdict']['options']
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
    $audio.outerHTML = `<button data-src-mp3="${$audio.dataset.src}" class="dictHjdict-Speaker">🔊</button>`
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
    ? { result: { type: 'lex', header, entries } }
    : handleNoResult()
}

function getLangCode (text: string, config: AppConfig): string {
  // ü
  if (/\u00fc/i.test(text)) {
    return config.dicts.all.hjdict.options.uas
  }

  // ä
  if (/\u00e4/i.test(text)) {
    return config.dicts.all.hjdict.options.aas
  }

  // é
  if (/\u00e9/i.test(text)) {
    return config.dicts.all.hjdict.options.eas
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
    return config.dicts.all.hjdict.options.engas
  }

  if (isContainJapanese(text)) {
    return 'jp/jc'
  }

  if (isContainKorean(text)) {
    return 'kor'
  }

  if (isContainChinese(text)) {
    return config.dicts.all.hjdict.options.chsas
  }

  return 'w'
}
