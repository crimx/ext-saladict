import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { DictConfigs } from '@/app-config'
import { getText, getInnerHTMLThunk, handleNoResult, HTMLString, handleNetWorkError, SearchFunction } from '../helpers'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk()

type EtymonlineResultItem = {
  title: string
  def: HTMLString
  href?: string
  chart?: string
}

export type EtymonlineResult = EtymonlineResultItem[]

type EtymonlineSearchResult = DictSearchResult<EtymonlineResult>

export const search: SearchFunction<EtymonlineSearchResult> = (
  text, config, payload
) => {
  const options = config.dicts.all.etymonline.options
  text = encodeURIComponent(text.replace(/\s+/g, ' '))

  // http to bypass the referer checking
  return fetchDirtyDOM('https://www.etymonline.com/word/' + text)
    .then(doc => handleDOM(doc, options))
    // .catch(() => fetchDirtyDOM('http://www.etymonline.com/search?q=' + text)
    //   .then(doc => handleDOM(doc, options))
    // )
    .catch(() => fetchDirtyDOM('https://www.etymonline.com/search?q=' + text)
      .catch(handleNetWorkError)
      .then(doc => handleDOM(doc, options))
    )
}

function handleDOM (
  doc: Document,
  options: DictConfigs['etymonline']['options'],
): EtymonlineSearchResult | Promise<EtymonlineSearchResult> {
  const result: EtymonlineResult = []
  const $items = Array.from(doc.querySelectorAll('[class*="word--"]'))

  for (let i = 0; i < $items.length && result.length < options.resultnum; i++) {
    const $item = $items[i]

    const title = getText($item, '[class*="word__name--"]')
    if (!title) { continue }

    let def = ''
    const $def = $item.querySelector('[class*="word__defination--"]>*')
    if ($def) {
      $def.querySelectorAll('.crossreference').forEach($cf => {
        let word = ($cf.textContent || '').trim()
        $cf.outerHTML = `<a href="https://www.etymonline.com/word/${word}" target="_blank">${word}</a>`
      })
      def = getInnerHTML($def)
    }
    if (!def) { continue }

    let href = ($item.getAttribute('href') || '')
      .replace(/^\/(?!\/)/, 'https://www.etymonline.com/')

    let chart = ''
    if (options.chart) {
      const $chart = $item.querySelector<HTMLImageElement>('[class*="chart--"] img')
      if ($chart) {
        chart = $chart.src.replace(/^\/(?!\/)/, 'https://www.etymonline.com/')
      }
    }

    result.push({ href, title, def, chart })
  }

  if (result.length > 0) {
    return { result }
  }

  return handleNoResult()
}
