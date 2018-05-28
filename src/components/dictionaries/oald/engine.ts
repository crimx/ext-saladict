import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { reflect } from '@/_helpers/promise-more'
import { HTMLString, getInnerHTMLThunk, handleNoResult, getText } from '../helpers'
import { AppConfig, DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('https://www.oxfordlearnersdictionaries.com/')

interface OALDResultItem {
  title: HTMLString
  prons: Array<{
    phsym: HTMLString
    pron: string
  }>
  defs: HTMLString
}

export interface OALDResultLex {
  type: 'lex'
  items: OALDResultItem[]
}

export interface OALDResultRelated {
  type: 'related'
  list: HTMLString
}

export type OALDResult = OALDResultLex | OALDResultRelated

type OALDSearchResult = DictSearchResult<OALDResult>
type OALDSearchResultLex = DictSearchResult<OALDResultLex>

export default function search (
  text: string,
  config: AppConfig,
): Promise<OALDSearchResult> {
  text = text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-')
  const options = config.dicts.all.oald.options

  return fetchDirtyDOM('https://www.oxfordlearnersdictionaries.com/definition/english/' + text)
    .then(doc => checkResult(doc, text, options))
}

function checkResult (
  doc: Document,
  text: string,
  options: DictConfigs['oald']['options'],
): OALDSearchResult | Promise<OALDSearchResult> {
  if (doc.querySelector('#entryContent')) {
    return getAllEntries(doc, text)
      .then(handleAllDOMs)
  } else if (options.related) {
    const $alternative = doc.querySelector('.result-list')
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

function getAllEntries (
  doc: Document,
  text: string,
): Promise<Document[]> {
  const wordTester = new RegExp(`/${text}_\\d+$`)
  const hrefs = [...doc.querySelectorAll<HTMLAnchorElement>('#relatedentries .list-col a')]
    .map($a => $a.getAttribute('href') || '')
    .filter(href => wordTester.test(href))

  if (hrefs.length > 0) {
    return reflect(hrefs.map(href => fetchDirtyDOM(href)))
      .then(docs => [doc, ...docs.filter(Boolean)])
  }

  return Promise.resolve([doc])
}

function handleAllDOMs (
  docs: Document[],
): OALDSearchResultLex | Promise<OALDSearchResultLex> {
  const results = docs.map(handleDOM)
    .filter((result): result is DictSearchResult<OALDResultItem> => result as any as boolean)
  if (results.length > 0) {
    let resultWithAudio = results.find(({ audio }) => (audio && audio.uk && audio.us) as any as boolean)
    if (!resultWithAudio) {
      resultWithAudio = results.find(({ audio }) => (audio && (audio.uk || audio.us)) as any as boolean)
    }
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
  doc: Document,
): null | DictSearchResult<OALDResultItem> {
  const result: OALDResultItem = {
    title: getInnerHTML(doc, '.webtop-g'),
    prons: [],
    defs: '',
  }

  const audio: { us?: string, uk?: string } = {}

  const $entry = doc.querySelector('#entryContent .h-g')
  if (!$entry) { return null }
  const $topCon = $entry.querySelector('.top-container')
  if (!$topCon) { return null }

  const $prons = $topCon.querySelector('.pron-gs')
  if ($prons) {
    $prons.querySelectorAll('.pron-g').forEach($p => {
      const $audio = $p.querySelector<HTMLDivElement>('.audio_play_button')
      if (!$audio) { return }
      const mp3 = $audio.dataset.srcMp3
      if (!mp3) { return }

      if ($audio.className.includes('pron-uk')) {
        audio.uk = mp3
      } else {
        audio.us = mp3
      }

      result.prons.push({ phsym: getInnerHTML($p), pron: mp3 })
    })
  }

  $topCon.remove()
  result.defs = getInnerHTML($entry)

  if (result.title && result.defs) {
    return { result, audio }
  }
  return null
}
