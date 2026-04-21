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
import { ensureZdicAudioReferer } from './referer'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.zdic.net/hans/${text}`
}

const HOST = 'https://www.zdic.net'

export type ZdicResult = Array<{
  title: string
  content: HTMLString
}>

type ZdicSearchResult = DictSearchResult<ZdicResult>

export const search: SearchFunction<ZdicResult> = (
  text,
  config,
  profile,
  payload
) => {
  const isAudio = profile.dicts.all.zdic.options.audio
  const ensureAudioReferer = isAudio
    ? ensureZdicAudioReferer().catch(error => {
        console.error(
          'Failed to enable Zdic audio referer compatibility.',
          error
        )
      })
    : Promise.resolve()

  return ensureAudioReferer.then(() =>
    fetchDirtyDOM(
      'https://www.zdic.net/hans/' +
        encodeURIComponent(text.replace(/\s+/g, ' '))
    )
      .catch(handleNetWorkError)
      .then(doc => handleDOM(doc, isAudio))
  )
}

function handleDOM(
  doc: Document,
  isAudio: boolean
): ZdicSearchResult | Promise<ZdicSearchResult> {
  const response: ZdicSearchResult = {
    result: []
  }

  for (const $entry of doc.querySelectorAll<HTMLDivElement>(
    '[data-type-block]'
  )) {
    const title = $entry.dataset.typeBlock || ''
    if (!/基本解释|词语解释|详细解释/.test(title)) {
      continue
    }

    for (const $a of $entry.querySelectorAll<HTMLAnchorElement>(
      '[data-src-mp3]'
    )) {
      if (isAudio) {
        if (!response.audio) {
          response.audio = {
            py: $a.dataset.srcMp3
          }
        }
        $a.replaceWith(getStaticSpeaker($a.dataset.srcMp3))
      } else {
        $a.remove()
      }
    }

    response.result.push({
      title,
      content: getInnerHTML(HOST, $entry, '.content')
    })
  }

  return response.result.length > 0 ? response : handleNoResult()
}
