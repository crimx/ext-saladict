import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import DOMPurify from 'dompurify'
import { handleNoResult } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

interface UrbanResultItem {
  /** keyword */
  title: string
  /** pronunciation */
  pron?: string
  meaning?: string
  example?: string
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

export default function search (
  text: string,
  config: AppConfig,
): Promise<UrbanSearchResult> {
  const options = config.dicts.all.urban.options

  return fetchDirtyDOM('http://www.urbandictionary.com/define.php?term=' + text)
    .then(doc => handleDom(doc, options))
}

function handleDom (
  doc: Document,
  { resultnum }: { resultnum: number }
): UrbanSearchResult | Promise<UrbanSearchResult> {
  let result: UrbanResult = []
  let audio: { us?: string } = {}

  let defPanels = Array.from(doc.querySelectorAll('.def-panel'))

  if (defPanels.length <= 0) {
    return handleNoResult()
  }

  for (let i = 0; i < defPanels.length && result.length < resultnum; i++) {
    const $panel = defPanels[i]

    let resultItem: UrbanResultItem = { title: '' }

    let $title = $panel.querySelector('.word')
    if ($title) {
      resultItem.title = $title.textContent || ''
    }

    if (!resultItem.title) {
      continue
    }

    let $pron = $panel.querySelector('.play-sound') as HTMLElement
    if ($pron && $pron.dataset.urls) {
      try {
        const pron = JSON.parse($pron.dataset.urls)[0]
        if (pron) {
          resultItem.pron = pron
          audio.us = pron
        }
      } catch (error) {/* ignore */}
    }

    let $meaning = $panel.querySelector('.meaning')
    if ($meaning) {
      resultItem.meaning = DOMPurify.sanitize($meaning.innerHTML)
        .replace(/href="\//g, 'href="https://www.urbandictionary.com/')
      if (/There aren't any definitions for/i.test(resultItem.meaning)) {
        continue
      }
    }

    let $example = $panel.querySelector('.example')
    if ($example) {
      resultItem.example = DOMPurify.sanitize($example.innerHTML)
        .replace(/href="\//g, 'href="https://www.urbandictionary.com/')
    }

    let $gif = $panel.querySelector('.gif > img') as HTMLImageElement
    if ($gif) {
      const $attr = $gif.nextElementSibling
      resultItem.gif = {
        src: $gif.src,
        attr: $attr && $attr.textContent || ''
      }
    }

    let $tags = Array.from($panel.querySelectorAll('.tags a'))
    if ($tags && $tags.length > 0) {
      resultItem.tags = $tags.map($tag => ($tag.textContent || ' ').slice(1))
    }

    let $contributor = $panel.querySelector('.contributor')
    if ($contributor) {
      resultItem.contributor = $contributor.textContent || ''
    }

    let $thumbsUp = $panel.querySelector('.thumbs .up .count')
    if ($thumbsUp) {
      resultItem.thumbsUp = $thumbsUp.textContent || ''
    }

    let $thumbsDown = $panel.querySelector('.thumbs .down .count')
    if ($thumbsDown) {
      resultItem.thumbsDown = $thumbsDown.textContent || ''
    }

    result.push(resultItem)
  }

  if (result.length > 0) {
    return { result, audio }
  } else {
    return handleNoResult()
  }
}
