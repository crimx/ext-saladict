import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

import axios from 'axios'

export const getSrcPage: GetSrcPageFunction = text => {
  return `http://www.urbandictionary.com/define.php?term=${text}`
}

const HOST = 'https://www.urbandictionary.com'

interface UrbanResultItem {
  /** keyword */
  title: string
  /** pronunciation */
  pron?: string
  meaning?: HTMLString
  example?: HTMLString
  gif?: {
    src: string
    attr: string
  }
  tags?: string[]
  /** who write this explanation */
  contributor?: string
  /** numbers of thumbs up */
  thumbsUp?: number
  /** numbers of thumbs down */
  thumbsDown?: number
}

interface thumbItem {
  current: string
  defid: number
  down: number
  up: number
}

interface thumbRes {
  thumbs: thumbItem[]
}

interface thumbMapItem {
  up: number
  down: number
}

interface thumbMap {
  [defid: string]: thumbMapItem
}

export type UrbanResult = UrbanResultItem[]

type UrbanSearchResult = DictSearchResult<UrbanResult>

export const search: SearchFunction<UrbanResult> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.urban.options

  return fetchDirtyDOM(
    'http://www.urbandictionary.com/define.php?term=' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, options))
}

/** get thumbs-up and thumbs-down nums  */
async function getThumbsNums(ids: string): Promise<thumbMap | null> {
  const thumbsMap: thumbMap = {}

  const result = await axios
    .get<thumbRes>(`https://api.urbandictionary.com/v0/uncacheable`, {
      params: {
        ids
      }
    })
    .catch(handleNetWorkError)

  if (!result?.data) {
    return null
  }

  result?.data?.thumbs?.map(t => {
    thumbsMap[t.defid] = {
      up: t.up,
      down: t.down
    }
  })
  return thumbsMap
}

async function handleDOM(
  doc: Document,
  { resultnum }: { resultnum: number }
): Promise<UrbanSearchResult> {
  const result: UrbanResult = []
  const audio: { us?: string } = {}

  const defPanels = Array.from(doc.querySelectorAll('.def-panel, .definition'))

  if (defPanels.length <= 0) {
    return handleNoResult()
  }

  const defIds: string[] = []

  for (let i = 0; i < defPanels.length && result.length < resultnum; i++) {
    const defId = defPanels[i]?.getAttribute('data-defid')

    defId && defIds.push(defId)
  }
  const thumbsMap = await getThumbsNums(defIds.join(','))

  for (let i = 0; i < defPanels.length && result.length < resultnum; i++) {
    const $panel = defPanels[i]
    const defId = defPanels[i]?.getAttribute('data-defid') || ''

    const resultItem: UrbanResultItem = { title: '' }

    resultItem.title = getText($panel, '.word')
    if (!resultItem.title) {
      continue
    }

    const $pron = $panel.querySelector('.play-sound') as HTMLElement
    if ($pron && $pron.dataset.urls) {
      try {
        const pron = JSON.parse($pron.dataset.urls)[0]
        if (pron) {
          resultItem.pron = pron
          audio.us = pron
        }
      } catch (error) {
        /* ignore */
      }
    }
    const $tts = $panel.querySelector('[data-tts-url]') as HTMLElement
    if (!resultItem.pron && $tts?.dataset.ttsUrl) {
      resultItem.pron = $tts.dataset.ttsUrl
      audio.us = resultItem.pron
    }

    resultItem.meaning = getInnerHTML(HOST, $panel, '.meaning')
    if (/There aren't any definitions for/i.test(resultItem.meaning || '')) {
      continue
    }

    resultItem.example = getInnerHTML(HOST, $panel, '.example')

    const $gif = $panel.querySelector('.gif > img') as HTMLImageElement
    if ($gif) {
      const $attr = $gif.nextElementSibling
      resultItem.gif = {
        src: $gif.src,
        attr: getText($attr)
      }
    }

    const $tags = Array.from($panel.querySelectorAll('.tags a'))
    if ($tags && $tags.length > 0) {
      resultItem.tags = $tags.map($tag => ($tag.textContent || ' ').slice(1))
    }

    resultItem.contributor = getText($panel, '.contributor')
    resultItem.thumbsUp = thumbsMap?.[defId]?.up ?? getThumbNum($panel, 'up')
    resultItem.thumbsDown =
      thumbsMap?.[defId]?.down ?? getThumbNum($panel, 'down')

    result.push(resultItem)
  }

  if (result.length > 0) {
    return { result, audio }
  } else {
    return handleNoResult()
  }
}

function getThumbNum($panel: Element, direction: 'up' | 'down') {
  const $button = $panel.querySelector(
    `input[name="direction"][value="${direction}"] + button`
  )
  const text = getText($button, 'span')
    .replace(/,/g, '')
    .trim()
  return text ? Number(text) : undefined
}
