import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { getStaticSpeaker } from '@/components/Speaker'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.zdic.net/hans/${text}`
}

const HOST = 'https://www.zdic.net'

export type ZdicResult = Array<{
  title: string
  content: HTMLString
}>

type ZdicSearchResult = DictSearchResult<ZdicResult>

const RESULT_TITLE = /基本解释|词语解释|详细解释/

export const search: SearchFunction<ZdicResult> = (
  text,
  config,
  profile,
  payload
) => {
  return fetchDirtyDOM(
    'https://www.zdic.net/hans/' + encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc))
}

function handleDOM(
  doc: Document
): ZdicSearchResult | Promise<ZdicSearchResult> {
  const response: ZdicSearchResult = {
    result: []
  }

  for (const $entry of doc.querySelectorAll<HTMLElement>(
    '[data-type-block], section.dict-section[data-section]'
  )) {
    const title = getEntryTitle($entry)
    if (!RESULT_TITLE.test(title)) {
      continue
    }

    removePageActions($entry)

    for (const $audio of $entry.querySelectorAll<HTMLElement>(
      '[data-src-mp3], [data-audio]'
    )) {
      const audio = getAudioSrc($audio)
      if (!response.audio) {
        response.audio = {
          py: audio
        }
      }
      $audio.replaceWith(getStaticSpeaker(audio))
    }

    response.result.push({
      title,
      content: getInnerHTML(HOST, $entry, getContentSelector($entry))
    })
  }

  return response.result.length > 0 ? response : handleNoResult()
}

function getEntryTitle($entry: HTMLElement): string {
  return $entry.dataset.typeBlock || $entry.dataset.section || ''
}

function getContentSelector($entry: HTMLElement): string {
  return $entry.dataset.typeBlock ? '.content' : '.dict-section__body'
}

function getAudioSrc($audio: HTMLElement): string {
  const src = $audio.dataset.srcMp3 || $audio.dataset.audio || ''
  return src.split(',')[0].trim()
}

function removePageActions($entry: HTMLElement) {
  $entry
    .querySelectorAll('.dict-section__footer, .feedback-link, script')
    .forEach($el => $el.remove())
}
