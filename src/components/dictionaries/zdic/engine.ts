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

let isRefererModified = false

export const search: SearchFunction<ZdicResult> = (
  text,
  config,
  profile,
  payload
) => {
  const isAudio = profile.dicts.all.zdic.options.audio
  if (!isRefererModified && isAudio) {
    isRefererModified = true
    modifyReferer()
  }

  return fetchDirtyDOM(
    'https://www.zdic.net/hans/' + encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, isAudio))
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

function modifyReferer() {
  const extraInfoSpec = ['blocking', 'requestHeaders']
  // https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
  if (
    browser.webRequest['OnBeforeSendHeadersOptions'] &&
    Object.prototype.hasOwnProperty.call(
      browser.webRequest['OnBeforeSendHeadersOptions'],
      'EXTRA_HEADERS'
    )
  ) {
    extraInfoSpec.push('extraHeaders')
  }

  browser.webRequest.onBeforeSendHeaders.addListener(
    details => {
      if (details && details.requestHeaders) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = 'https://www.zdic.net'
            break
          }
        }
        if (i === details.requestHeaders.length) {
          details.requestHeaders.push({
            name: 'Referer',
            value: 'https://www.zdic.net'
          })
        }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: ['https://img.zdic.net/audio/*'] },
    /** WebExt type is missing Chrome support */
    extraInfoSpec as any
  )
}
