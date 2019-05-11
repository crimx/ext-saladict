import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTMLBuilder,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  removeChildren,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'

export type JukuuLang = 'engjp' | 'zhjp' | 'zheng'

function getUrl (text: string, lang: JukuuLang) {
  text = encodeURIComponent(text.replace(/\s+/g, '+'))

  switch (lang) {
    case 'engjp':
      return 'http://www.jukuu.com/jsearch.php?q=' + text
    case 'zhjp':
      return 'http://www.jukuu.com/jcsearch.php?q=' + text
    // case 'zheng':
    default:
      return 'http://www.jukuu.com/search.php?q=' + text
  }
}

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return getUrl(text, profile.dicts.all.jukuu.options.lang)
}

const getInnerHTML = getInnerHTMLBuilder('http://www.jukuu.com')

interface JukuuTransItem {
  trans: HTMLString
  original: string
  src: string
}

export interface JukuuResult {
  lang: JukuuLang
  sens: JukuuTransItem[]
}

export interface JukuuPayload {
  lang?: JukuuLang
}

type JukuuSearchResult = DictSearchResult<JukuuResult>

export const search: SearchFunction<JukuuSearchResult, JukuuPayload> = (
  text, config, profile, payload
) => {
  const lang = payload.lang || profile.dicts.all.jukuu.options.lang
  return fetchDirtyDOM(getUrl(text, lang))
    .catch(handleNetWorkError)
    .then(handleDOM)
    .then(sens => sens.length > 0
      ? { result: { lang, sens } }
      : handleNoResult()
    )
}

function handleDOM (
  doc: Document,
): JukuuTransItem[] {
  return [...doc.querySelectorAll('tr.e')]
    .map($e => {
      const $trans = $e.lastElementChild
      if (!$trans) {
        return
      }
      removeChildren($trans, 'img')

      const $original = $e.nextElementSibling
      if (!$original || !$original.classList.contains('c')) {
        return
      }

      const $src = $original.nextElementSibling

      return {
        trans: getInnerHTML($trans),
        original: getText($original),
        src: $src && $src.classList.contains('s')
          ? getText($src).replace(/^[\s-]*/, '')
          : ''
      }
    })
    .filter((item): item is JukuuTransItem => Boolean(item && item.trans))
}
