import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { HTMLString, getInnerHTMLThunk, handleNoResult, handleNetWorkError } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('http://www.zdic.net/')

export interface ZdicResult {
  /** phonetic symbols */
  phsym: Array<{
    /** Pinyin */
    pinyin: string
    /** pronunciation src */
    pron: string
  }>
  /** html result */
  defs: HTMLString
}

type ZdicSearchResult = DictSearchResult<ZdicResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<ZdicSearchResult> {
  return fetchDirtyDOM('http://www.zdic.net/search/?c=3&q=' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(deobfuscate)
    .then(handleDOM)
}

const junkStyleTester = /\.(\S+)(?=\s?\{\s*display\s?:\s?none)/ig
function deobfuscate (doc: Document): Document {
  doc.querySelectorAll('style').forEach($style => {
    const styleContent = $style.textContent || ''
    if (styleContent) {
      (styleContent.match(junkStyleTester) || [])
        .forEach(junkClassName => {
          doc.querySelectorAll(junkClassName)
            .forEach($junkEl => $junkEl.remove())
        })
    }
  })
  return doc
}

function handleDOM (doc: Document): ZdicSearchResult | Promise<ZdicSearchResult> {
  return doc.querySelector('#tagContent0')
    ? handleWord(doc)
    : handlePhrase(doc)
}

function handleWord (doc: Document): ZdicSearchResult | Promise<ZdicSearchResult> {
  const $content = doc.querySelector('#tagContent0')
  if (!$content) { return handleNoResult() }

  const phsym: ZdicResult['phsym'] = []
  const $zui = $content.querySelector('.zui')
  if ($zui) {
    $zui.querySelectorAll<HTMLAnchorElement>('.dicpy a').forEach($a => {
      phsym.push({
        pinyin: ($a.textContent || '').trim(),
        pron: `http://www.zdic.net/p/mp3/${($a.href.match(/[^=]+$/) || [''])[0]}.mp3`
      })
    })
    $zui.remove()
  }

  // 五笔、仓颉、郑码
  const $diczx7 = $content.querySelector('.diczx7')
  if ($diczx7 && $diczx7.parentElement) {
    $diczx7.parentElement.remove()
  }

  // 笔顺编号、四角号码、Unicode
  const $diczx6 = $content.querySelector('.diczx6')
  if ($diczx6 && $diczx6.parentElement) {
    $diczx6.parentElement.remove()
  }

  // Mark headers, which are elements before hrs
  $content.querySelectorAll('.dichr').forEach($hr => {
    const $header = $hr.previousElementSibling
    if ($header) {
      $header.classList.add('zdic-header')
    }
  })

  return {
    result: {
      defs: getInnerHTML($content),
      phsym,
    },
    audio: phsym.length > 0
      ? { py: phsym[0].pron }
      : undefined
  }
}

function handlePhrase (doc: Document): ZdicSearchResult | Promise<ZdicSearchResult> {
  const $cdnr = doc.querySelector('.cdnr')
  if (!$cdnr) { return handleNoResult() }

  let phsym: ZdicResult['phsym'] = []

  // get pinyin src from js function
  const pinyinTester = /\("(.*)"\)/
  Array.from($cdnr.querySelectorAll<HTMLScriptElement>('script'))
    .find(({ textContent }) => {
      if (!textContent) { return false }

      const $pinyins = $cdnr.querySelector('.dicpy')
      if (!$pinyins) { return false }
      const pinyinsContent = $pinyins.textContent
      if (!pinyinsContent) { return false }

      const p = textContent.match(pinyinTester)
      if (!p) { return false }

      const prons = p[1].split(' ')
      const pinyins = pinyinsContent.trim().split(' ')
      if (prons.length === pinyins.length) {
        phsym = pinyins.map((pinyin, i) => ({
          pinyin,
          pron: `http://www.zdic.net/p/mp3/${prons[i]}.mp3`
        }))
        return true
      }
      return false
    })

  return {
    result: {
      defs: getInnerHTML($cdnr),
      phsym,
    },
    audio: phsym.length > 0
      ? { py: phsym[0].pron }
      : undefined
  }
}
