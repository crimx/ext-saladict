import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  getOuterHTML,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getText,
  removeChild
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.weblio.jp/content/${text}`
}

const HOST = 'https://www.weblio.jp'

export type WeblioResult = Array<{
  title: HTMLString
  def: HTMLString
}>

type WeblioSearchResult = DictSearchResult<WeblioResult>

export const search: SearchFunction<WeblioResult> = (
  text,
  config,
  profile,
  payload
) => {
  return fetchDirtyDOM(
    'https://www.weblio.jp/content/' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM(
  doc: Document
): WeblioSearchResult | Promise<WeblioSearchResult> {
  const result: WeblioResult = []
  const $titles = doc.querySelectorAll<HTMLAnchorElement>(
    '#cont>.pbarT .pbarTL>a'
  )
  doc
    .querySelectorAll<HTMLDivElement>('#cont>.kijiWrp>.kiji')
    .forEach(($dict, i) => {
      const $title = $titles[i]
      if (!$title) {
        if (process.env.DEBUG) {
          console.error(`Dict Weblio: missing title`)
        }
        return
      }

      if ($title.title === '百科事典') {
        // too long
        return
      }

      result.push({
        title: getOuterHTML(HOST, $title, { config: {} }),
        def: getInnerHTML(HOST, $dict, { config: {} })
      })
    })

  if (result.length <= 0) {
    doc.querySelectorAll('.section-card .basic-card').forEach($card => {
      const title = getText($card, '.pbarT h2')
      if (title) {
        removeChild($card, '.pbarT')
        result.push({
          title,
          def: getInnerHTML(HOST, $card, { config: {} })
        })
      }
    })
  }

  return result.length > 0 ? { result } : handleNoResult()
}
