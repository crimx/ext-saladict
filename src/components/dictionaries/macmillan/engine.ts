import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { reflect } from '@/_helpers/promise-more'
import { HTMLString, getInnerHTMLThunk, handleNoResult } from '../helpers'
import { AppConfig, DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('http://www.macmillandictionary.com/')

interface MacmillanResultItem {
  title: string
  senses: HTMLString
  /** part of speech */
  pos: string
  /** syntax coding */
  sc: string
  phsym: string
  pron?: string
  ratting?: number
}

export interface MacmillanResultLex {
  type: 'lex'
  items: MacmillanResultItem[]
}

export interface MacmillanResultRelated {
  type: 'related'
  list: HTMLString
}

export type MacmillanResult = MacmillanResultLex | MacmillanResultRelated

type MacmillanSearchResult = DictSearchResult<MacmillanResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<MacmillanSearchResult> {
  const options = config.dicts.all.macmillan.options

  return fetchDirtyDOM('http://www.macmillandictionary.com/dictionary/british/' + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
    .then(doc => checkResult(doc, options))
}

function checkResult (
  doc: Document,
  options: DictConfigs['macmillan']['options']
): MacmillanSearchResult | Promise<MacmillanSearchResult> {
  if (doc.querySelector('.senses .SENSE')) {
    return Promise.resolve(doc)
      .then(getAllResults)
      .then(handleAllDOMs)
  } else if (options.related) {
    const $alternative = doc.querySelector<HTMLAnchorElement>('#search-results ul')
    if ($alternative) {
      return {
        result: {
          type: 'related',
          list: getInnerHTML($alternative)
        }
      }
    }
  }
  return handleNoResult()
}

/** Find all results of the same word */
function getAllResults (doc: Document): Document[] | Promise<Document[]> {
  const $link = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!$link) { return [doc] }

  const keyword = (/[^/]+(?=_\d+$)/.exec($link.href) || [''])[0]
  if (!keyword) { return [doc] }

  const keywordTester = new RegExp(keyword + '_\\d+$')
  const $related = Array.from(doc.querySelectorAll<HTMLAnchorElement>('#relatedentries li a'))
    .filter(a => keywordTester.test(a.href))
  if ($related.length <= 0) { return [doc] }

  return reflect($related.map(a => fetchDirtyDOM(a.href)))
    .then(docs => [doc, ...docs.filter((d): d is Document => d as any as boolean)])
}

function handleAllDOMs (
  docs: Document[]
): MacmillanSearchResult | Promise<MacmillanSearchResult> {
  let results = docs.map(handleDOM)
    .filter((result): result is DictSearchResult<MacmillanResultItem> => result as any as boolean)
  if (results.length > 0) {
    const resultWithAudio = results.find(({ audio }) => (audio && audio.uk) as any as boolean)
    const audio = resultWithAudio ? resultWithAudio.audio : undefined
    return {
      result: {
        type: 'lex',
        items: results.map(({ result }) => result)
      },
      audio,
    }
  }
  return handleNoResult()
}

function handleDOM (
  doc: Document
): null | DictSearchResult<MacmillanResultItem> {
  const result: MacmillanResultItem = {
    title: '',
    senses: '',
    /** part of speech */
    pos: '',
    /** syntax coding */
    sc: '',
    phsym: '',
  }

  const audio: { uk?: string } = {}

  const $title = doc.querySelector('#headword .BASE')
  if (!$title) { return null }
  result.title = $title.textContent || ''
  if (!result.title) { return null }

  const $headbar = doc.querySelector('#headbar')

  if ($headbar) {
    const $pos = $headbar.querySelector('.PART-OF-SPEECH')
    if ($pos) { result.pos = ($pos.textContent || '').toUpperCase() }

    const $sc = $headbar.querySelector('.SYNTAX-CODING')
    if ($sc) { result.sc = $sc.textContent || '' }

    const $pron = $headbar.querySelector('.PRON')
    if ($pron) { result.phsym = $pron.textContent || '' }

    const $sound = $headbar.querySelector<HTMLDivElement>('.PRONS .sound')
    if ($sound && $sound.dataset.srcMp3) {
      result.pron = $sound.dataset.srcMp3
      audio.uk = result.pron
    }
  }

  const $rate = doc.querySelector('.stars_grp')
  if ($rate) {
    result.ratting = $rate.querySelectorAll('.icon_star').length
  }

  const $senses = doc.querySelector('.senses')
  if ($senses && $senses.querySelectorAll('.SENSE').length > 0) {
    $senses.querySelectorAll<HTMLAnchorElement>('a.moreButton').forEach($a => {
      $a.rel = 'nofollow'
    })
    result.senses = getInnerHTML($senses)
  } else {
    return null
  }

  return { result, audio }
}
