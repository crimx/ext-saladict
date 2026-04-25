import { fetchDirtyDOM, fetchPlainText } from '@/_helpers/fetch-dom'
import {
  getText,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://dict.eudic.net/dicts/en/${text}`
}

interface EudicResultItem {
  chs: string
  eng: string
  mp3?: string
  channel?: string
}

export type EudicResult = EudicResultItem[]

type EudicSearchResult = DictSearchResult<EudicResult>

export const search: SearchFunction<EudicResult> = (
  text,
  config,
  profile,
  payload
) => {
  text = encodeURIComponent(
    text
      .split(/\s+/)
      .slice(0, 2)
      .join(' ')
  )
  const options = profile.dicts.all.eudic.options
  const searchUrl = 'https://dict.eudic.net/dicts/en/' + text

  return fetchDirtyDOM(searchUrl, {
    withCredentials: false
  })
    .catch(handleNetWorkError)
    .then(validator)
    .then(doc => handleDOM(doc, options))
}

function handleDOM(
  doc: Document,
  { resultnum }: { resultnum: number }
): EudicSearchResult | Promise<EudicSearchResult> {
  const result: EudicResult = []
  const audio: { uk?: string; us?: string } = {}

  const $items = Array.from(doc.querySelectorAll('#lj_ting .lj_item'))
  for (let i = 0; i < $items.length && result.length < resultnum; i++) {
    const $item = $items[i]
    const item: EudicResultItem = { chs: '', eng: '' }

    item.chs = getText($item, '.exp')
    if (!item.chs) {
      continue
    }

    item.eng = getText($item, '.line')
    if (!item.eng) {
      continue
    }

    item.channel = getText($item, '.channel_title')

    const audioID = $item.getAttribute('source')
    if (audioID) {
      const mp3 =
        'https://fs-gateway.eudic.net/store_main/sentencemp3/' +
        audioID +
        '.mp3'
      item.mp3 = mp3
      if (!audio.us) {
        audio.us = mp3
        audio.uk = mp3
      }
    }

    result.push(item)
  }

  if (result.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}

function validator(doc: Document): Document | Promise<Document> {
  if (doc.querySelector('#lj_ting .lj_item')) {
    return doc
  }

  const status = doc.querySelector('#page-status') as HTMLInputElement
  if (!status || !status.value) {
    return handleNoResult()
  }

  const data = 'status=' + encodeURIComponent(status.value)

  return fetchPlainText('https://dict.eudic.net/Dicts/en/tab-detail/-12', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: false
  })
    .then(html => new DOMParser().parseFromString(html, 'text/html'))
    .catch(handleNetWorkError)
}
