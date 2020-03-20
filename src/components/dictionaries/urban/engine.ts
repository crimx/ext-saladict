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
  thumbsUp?: string
  /** numbers of thumbs down */
  thumbsDown?: string
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

function handleDOM(
  doc: Document,
  { resultnum }: { resultnum: number }
): UrbanSearchResult | Promise<UrbanSearchResult> {
  const result: UrbanResult = []
  const audio: { us?: string } = {}

  const defPanels = Array.from(doc.querySelectorAll('.def-panel'))

  if (defPanels.length <= 0) {
    return handleNoResult()
  }

  for (let i = 0; i < defPanels.length && result.length < resultnum; i++) {
    const $panel = defPanels[i]

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
    resultItem.thumbsUp = getText($panel, '.thumbs .up .count')
    resultItem.thumbsDown = getText($panel, '.thumbs .down .count')

    result.push(resultItem)
  }

  if (result.length > 0) {
    return { result, audio }
  } else {
    return handleNoResult()
  }
}
