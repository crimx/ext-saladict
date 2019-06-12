import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  getOuterHTMLBuilder,
  HTMLString,
  externalLink,
  getText,
  removeChildren,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { getStaticSpeakerHTML } from '@/components/withStaticSpeaker'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://ejje.weblio.jp/content/${encodeURIComponent(text.replace(/\s+/g, '+'))}`
}

export type WeblioejjeResult = Array<{
  title?: string
  content: HTMLString
}>

type WeblioejjeSearchResult = DictSearchResult<WeblioejjeResult>

export const search: SearchFunction<WeblioejjeSearchResult> = (
  text, config, profile, payload
) => {
  return fetchDirtyDOM(getSrcPage(text, config, profile))
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM (doc: Document): WeblioejjeSearchResult | Promise<WeblioejjeSearchResult> {
  const getOuterHTML = getOuterHTMLBuilder('https://ejje.weblio.jp')
  const result: WeblioejjeResult = []

  doc.querySelectorAll<HTMLDivElement>('.mainBlock').forEach($entry => {
    if ($entry.id === 'summary') {
      let head = ''

      const $summaryTbl = $entry.querySelector('.summaryTbl')
      if ($summaryTbl) {
        head += getOuterHTML($summaryTbl, '.summaryL h1')

        const $audio = $summaryTbl.querySelector('.summaryC audio source')
        if ($audio) {
          head += getStaticSpeakerHTML($audio.getAttribute('src'))
        }

        $summaryTbl.outerHTML = `<div class="summaryHead">${head}</div>`
      }

      removeChildren($entry, '#leadBtnWrp')
      removeChildren($entry, '.addLmFdWr')
      removeChildren($entry, '.flex-rectangle-ads-frame')
      removeChildren($entry, '.outsideLlTable')

      result.push({ content: getOuterHTML($entry) })
      return
    }

    if (!$entry.className.includes('hlt_') ||
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
        $audio.outerHTML = getStaticSpeakerHTML($source.getAttribute('src'))
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

    result.push({ title, content: getOuterHTML($entry) })
  })

  return result.length > 0 ? { result } : handleNoResult()
}
