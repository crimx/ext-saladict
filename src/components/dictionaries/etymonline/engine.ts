import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { DictConfigs } from '@/app-config'
import {
  getText,
  getInnerHTML,
  getFullLink,
  handleNoResult,
  HTMLString,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `http://www.etymonline.com/search?q=${text}`
}

const HOST = 'https://www.etymonline.com'

type EtymonlineResultItem = {
  id: string
  title: string
  def: HTMLString
  href?: string
  chart?: string
}

export type EtymonlineResult = EtymonlineResultItem[]

type EtymonlineSearchResult = DictSearchResult<EtymonlineResult>

export const search: SearchFunction<EtymonlineResult> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.etymonline.options
  text = encodeURIComponent(text.replace(/\s+/g, ' '))

  // http to bypass the referer checking
  return fetchDirtyDOM('https://www.etymonline.com/word/' + text)
    .catch(() => fetchDirtyDOM('https://www.etymonline.com/search?q=' + text))
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, options))
}

function handleDOM(
  doc: Document,
  options: DictConfigs['etymonline']['options']
): EtymonlineSearchResult | Promise<EtymonlineSearchResult> {
  const result: EtymonlineResult = []
  const catalog: NonNullable<EtymonlineSearchResult['catalog']> = []
  const $items = Array.from(doc.querySelectorAll('[class*="word--"]'))

  for (let i = 0; i < $items.length && result.length < options.resultnum; i++) {
    const $item = $items[i]

    const title = getText($item, '[class*="word__name--"]')
    if (!title) {
      continue
    }

    let def = ''
    const $def = $item.querySelector('[class*="word__defination--"]>*')
    if ($def) {
      $def.querySelectorAll('.crossreference').forEach($cf => {
        const word = getText($cf)

        const $a = document.createElement('a')
        $a.target = '_blank'
        $a.href = `https://www.etymonline.com/word/${word}`
        $a.textContent = word

        $cf.replaceWith($a)
      })
      def = getInnerHTML(HOST, $def)
    }
    if (!def) {
      continue
    }

    const href = getFullLink(HOST, $item, 'href')

    let chart = ''
    if (options.chart) {
      const $chart = $item.querySelector<HTMLImageElement>(
        '[class*="chart--"] img'
      )
      if ($chart) {
        chart = getFullLink(HOST, $chart, 'src')
      }
    }

    const id = `d-etymonline-entry${i}`

    result.push({ id, href, title, def, chart })

    catalog.push({
      key: `#${i}`,
      value: id,
      label: `#${title}`
    })
  }

  if (result.length > 0) {
    return { result, catalog }
  }

  return handleNoResult()
}
