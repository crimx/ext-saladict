import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import DOMPurify from 'dompurify'
import { handleNoResult } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

type EtymonlineResultItem = {
  title: string
  href: string
  def: string
}

export type EtymonlineResult = EtymonlineResultItem[]

type EtymonlineSearchResult = DictSearchResult<EtymonlineResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<EtymonlineSearchResult> {
  const options = config.dicts.all.etymonline.options

  // http to bypass the referer checking
  return fetchDirtyDOM('http://www.etymonline.com/search?q=' + text)
    .then(doc => handleDom(doc, options))
    .catch(() => fetchDirtyDOM('https://www.etymonline.com/search?q=' + text)
      .then(doc => handleDom(doc, options))
    )
}

function handleDom (
  doc: Document,
  { resultnum }: { resultnum: number },
): EtymonlineSearchResult | Promise<EtymonlineSearchResult> {
  const result: EtymonlineResult = []
  const $items = Array.from(doc.querySelectorAll('[class^="word--"]'))

  for (let i = 0; i < $items.length && result.length < resultnum; i++) {
    const $item = $items[i]

    let href = $item.getAttribute('href') || ''
    if (href[0] === '/') {
      href = 'https://www.etymonline.com' + href
    }
    if (!href) { continue }

    let title = ''
    const $title = $item.querySelector('[class^="word__name--"]')
    if ($title) {
      title = ($title.textContent || '').trim()
    }
    if (!title) { continue }

    let def = ''
    const $def = $item.querySelector('[class^="word__defination--"]>object')
    if ($def) {
      $def.querySelectorAll('.crossreference').forEach($cf => {
        let word = ($cf.textContent || '').trim()
        $cf.outerHTML = `<a href="https://www.etymonline.com/word/${word}" target="_blank">${word}</a>`
      })
      def = DOMPurify.sanitize($def.innerHTML)
    }
    if (!def) { continue }

    result.push({ href, title, def })
  }

  if (result.length > 0) {
    return { result }
  }

  return handleNoResult()
}
