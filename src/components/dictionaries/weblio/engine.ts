import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTMLBuilder,
  handleNoResult,
  handleNetWorkError,
  getOuterHTMLBuilder,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://www.weblio.jp/content/${text}`
}

const getInnerHTML = getInnerHTMLBuilder('https://www.weblio.jp/', {}) // keep inline style
const getOuterHTML = getOuterHTMLBuilder('https://www.weblio.jp/', {}) // keep inline style

export type WeblioResult = Array<{
  title: HTMLString
  def: HTMLString
}>

type WeblioSearchResult = DictSearchResult<WeblioResult>

export const search: SearchFunction<WeblioSearchResult> = (
  text, config, profile, payload
) => {
  return fetchDirtyDOM('https://www.weblio.jp/content/' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM (
  doc: Document,
): WeblioSearchResult | Promise<WeblioSearchResult> {
  const result: WeblioResult = []
  const $titles = doc.querySelectorAll<HTMLAnchorElement>('#cont>.pbarT .pbarTL>a')
  doc.querySelectorAll<HTMLDivElement>('#cont>.kijiWrp>.kiji').forEach(($dict, i) => {
    const $title = $titles[i]
    if (!$title) {
      if (process.env.DEV_BUILD) {
        console.error(`Dict Weblio: missing title`)
      }
      return
    }

    if ($title.title === '百科事典') {
      // too long
      return
    }

    result.push({
      title: getOuterHTML($title),
      def: getInnerHTML($dict),
    })
  })

  return result.length > 0 ? { result } : handleNoResult()
}
