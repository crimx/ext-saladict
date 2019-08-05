import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  getOuterHTML,
  HTMLString,
  externalLink,
  getText,
  removeChildren,
  DictSearchResult
} from '../helpers'
import { getStaticSpeakerString, getStaticSpeaker } from '@/components/Speaker'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://ejje.weblio.jp/content/${encodeURIComponent(
    text.replace(/\s+/g, '+')
  )}`
}

const HOST = 'https://ejje.weblio.jp'

export type WeblioejjeResult = Array<{
  title?: string
  content: HTMLString
}>

type WeblioejjeSearchResult = DictSearchResult<WeblioejjeResult>

export const search: SearchFunction<WeblioejjeResult> = (
  text,
  config,
  profile,
  payload
) => {
  return fetchDirtyDOM(getSrcPage(text, config, profile))
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM(
  doc: Document
): WeblioejjeSearchResult | Promise<WeblioejjeSearchResult> {
  const result: WeblioejjeResult = []

  doc.querySelectorAll<HTMLDivElement>('.mainBlock').forEach($entry => {
    if ($entry.id === 'summary') {
      let head = ''

      const $summaryTbl = $entry.querySelector('.summaryTbl')
      if ($summaryTbl) {
        head += getOuterHTML(HOST, $summaryTbl, '.summaryL h1')

        const $audio = $summaryTbl.querySelector('.summaryC audio source')
        if ($audio) {
          head += getStaticSpeakerString($audio.getAttribute('src'))
        }

        $summaryTbl.outerHTML = `<div class="summaryHead">${head}</div>`
      }

      removeChildren($entry, '#leadBtnWrp')
      removeChildren($entry, '.addLmFdWr')
      removeChildren($entry, '.flex-rectangle-ads-frame')
      removeChildren($entry, '.outsideLlTable')

      result.push({ content: getOuterHTML(HOST, $entry) })
      return
    }

    if (
      !$entry.className.includes('hlt_') ||
      $entry.classList.contains('hlt_CPRHT') ||
      $entry.classList.contains('hlt_RLTED')
    ) {
      return
    }

    let title = ''
    let $title = $entry.querySelector('.wrp')
    if ($title) {
      title = getText($title, '.dictNm')
      if (title.includes('Wiktionary')) {
        return
      }
      $title.remove()
    } else {
      $title = $entry.querySelector('.qotH')
      if ($title) {
        title = getText($title, '.qotHT')
        $title.remove()
      }
    }

    removeChildren($entry, '.hideDictWrp')
    removeChildren($entry, '.kijiFoot')
    removeChildren($entry, '.addToSlBtnCntner')

    $entry.querySelectorAll('.fa-volume-up').forEach($audio => {
      const $source = $audio.querySelector('source')
      if ($source) {
        $audio.replaceWith(getStaticSpeaker($source.getAttribute('src')))
      }
    })

    $entry.querySelectorAll('br').forEach($br => {
      $br.classList.add('br')
      $br.outerHTML = `<div class="${$br.className}"></div>`
    })

    $entry.querySelectorAll('a').forEach($a => {
      if (!$a.classList.contains('crosslink')) {
        externalLink($a)
      }
    })

    result.push({ title, content: getOuterHTML(HOST, $entry) })
  })

  return result.length > 0 ? { result } : handleNoResult()
}
