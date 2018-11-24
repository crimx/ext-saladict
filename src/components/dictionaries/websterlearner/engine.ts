import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTMLBuilder,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `http://www.learnersdictionary.com/definition/${text.trim().split(/\s+/).join('-')}`
}

const getInnerHTML = getInnerHTMLBuilder('http://www.learnersdictionary.com/')

interface WebsterLearnerResultItem {
  title: HTMLString
  pron?: string

  infs?: HTMLString
  infsPron?: string

  labels?: HTMLString
  senses?: HTMLString
  phrases?: HTMLString
  derived?: HTMLString
  arts?: string[]
}

export interface WebsterLearnerResultLex {
  type: 'lex'
  items: WebsterLearnerResultItem[]
}

export interface WebsterLearnerResultRelated {
  type: 'related'
  list: HTMLString
}

export type WebsterLearnerResult = WebsterLearnerResultLex | WebsterLearnerResultRelated

type WebsterLearnerSearchResult = DictSearchResult<WebsterLearnerResult>
type WebsterLearnerSearchResultLex = DictSearchResult<WebsterLearnerResultLex>

export const search: SearchFunction<WebsterLearnerSearchResult> = (
  text, config, payload
) => {
  const options = config.dicts.all.websterlearner.options

  return fetchDirtyDOM('http://www.learnersdictionary.com/definition/' + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options))
}

function checkResult (
  doc: Document,
  options: DictConfigs['websterlearner']['options'],
): WebsterLearnerSearchResult | Promise<WebsterLearnerSearchResult> {
  const $alternative = doc.querySelector<HTMLAnchorElement>('[id^="spelling"] .links')
  if (!$alternative) {
    return handleDOM(doc, options)
  } else if (options.related) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML($alternative)
      }
    }
  }
  return handleNoResult()
}

function handleDOM (
  doc: Document,
  options: DictConfigs['websterlearner']['options'],
): WebsterLearnerSearchResultLex | Promise<WebsterLearnerSearchResultLex> {
  doc.querySelectorAll('.d_hidden').forEach(el => el.remove())

  const result: WebsterLearnerResultLex = {
    type: 'lex',
    items: []
  }
  const audio: { us?: string } = {}

  doc.querySelectorAll('.entry').forEach($entry => {
    const entry: WebsterLearnerResultItem = {
      title: ''
    }

    const $headword = $entry.querySelector('.hw_d')
    if (!$headword) { return }
    const $pron = $headword.querySelector<HTMLAnchorElement>('.play_pron')
    if ($pron) {
      const path = ($pron.dataset.lang || '').replace('_', '/')
      const dir = $pron.dataset.dir || ''
      const file = $pron.dataset.file || ''
      entry.pron = `http://media.merriam-webster.com/audio/prons/${path}/mp3/${dir}/${file}.mp3`
      audio.us = entry.pron
      $pron.remove()
    }
    entry.title = getInnerHTML($headword)

    const $headwordInfs = $entry.querySelector('.hw_infs_d')
    if ($headwordInfs) {
      const $pron = $headwordInfs.querySelector<HTMLAnchorElement>('.play_pron')
      if ($pron) {
        const path = ($pron.dataset.lang || '').replace('_', '/')
        const dir = $pron.dataset.dir || ''
        const file = $pron.dataset.file || ''
        entry.infsPron = `http://media.merriam-webster.com/audio/prons/${path}/mp3/${dir}/${file}.mp3`
        $pron.remove()
      }
      entry.infs = getInnerHTML($headwordInfs)
    }

    entry.labels = getInnerHTML($entry, '.labels')

    if (options.defs) {
      entry.senses = getInnerHTML($entry, '.sblocks')
    }

    if (options.phrase) {
      entry.phrases = getInnerHTML($entry, '.dros')
    }

    if (options.derived) {
      entry.derived = getInnerHTML($entry, '.uros')
    }

    if (options.arts) {
      entry.arts = Array.from($entry.querySelectorAll<HTMLImageElement>('.arts img'))
        .map($img => $img.src)
    }

    if (entry.senses || entry.phrases || entry.derived || (entry.arts && entry.arts.length > 0)) {
      result.items.push(entry)
    }
  })

  if (result.items.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}
