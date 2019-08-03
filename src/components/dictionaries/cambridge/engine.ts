import { chsToChz } from '@/_helpers/chs-to-chz'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  getText,
  removeChild,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = (text, config) => {
  switch (config.langCode) {
    case 'en':
      return `https://dictionary.cambridge.org/search/english/direct/?q=${text
        .trim()
        .split(/\s+/)
        .join('-')}`
    case 'zh-CN':
      return `https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q=${text}`
    case 'zh-TW':
      return `https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q=${chsToChz(
        text
      )}`
  }
}

const HOST = 'https://dictionary.cambridge.org'

interface CambridgeResultItem {
  title: HTMLString
  pos: HTMLString
  prons: Array<{
    phsym: string
    pron: string
  }>
  defs: HTMLString
}

export type CambridgeResult = CambridgeResultItem[]

type CambridgeSearchResult = DictSearchResult<CambridgeResult>

export const search: SearchFunction<CambridgeResult> = (
  text,
  config,
  profile,
  payload
) => {
  const url =
    config.langCode === 'zh-CN'
      ? 'https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q='
      : config.langCode === 'zh-TW'
      ? 'https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q='
      : 'https://dictionary.cambridge.org/search/english/direct/?q='

  return fetchDirtyDOM(
    encodeURI(url) + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-')
  )
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM(
  doc: Document
): CambridgeSearchResult | Promise<CambridgeSearchResult> {
  const result: CambridgeResult = []
  const audio: { us?: string; uk?: string } = {}

  doc.querySelectorAll('.entry-body__el').forEach($entry => {
    const entry: CambridgeResultItem = {
      title: getText($entry, '.headword'),
      pos: '',
      prons: [],
      defs: ''
    }

    if (!entry.title) {
      return
    }

    const $posHeader = $entry.querySelector('.pos-header')
    if ($posHeader) {
      $posHeader.querySelectorAll('.region').forEach($region => {
        const $pron = $region.parentElement as HTMLElement
        const $btn = $pron.querySelector<HTMLSpanElement>('.audio_play_button')
        if (!$btn) {
          return
        }
        if ($btn.dataset.srcMp3) {
          const pron = $btn.dataset.srcMp3.replace(
            /^\//,
            'https://dictionary.cambridge.org/'
          )
          const phsym = getText($pron).trim()
          entry.prons.push({ phsym, pron })

          if (!audio.uk && phsym.includes('uk')) {
            audio.uk = pron
          }

          if (!audio.us && phsym.includes('us')) {
            audio.us = pron
          }
        }
        $pron.remove()
      })
      removeChild($posHeader, '.headword')
      removeChild($posHeader, '.share')
      entry.pos = getInnerHTML(HOST, $posHeader)
      $posHeader.remove()
    }

    entry.defs = getInnerHTML(HOST, $entry)
    if (!entry.defs) {
      return
    }

    result.push(entry)
  })

  if (result.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}
