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
  const result = Array.from(doc.querySelectorAll('[class^="word--"]'))
    .slice(0, resultnum)
    .map<EtymonlineResultItem | undefined>(el => {
      let href = el.getAttribute('href') || ''
      if (href[0] === '/') {
        href = 'https://www.etymonline.com' + href
      }

      let title = ''
      const $title = el.querySelector('[class^="word__name--"]')
      if ($title) {
        title = ($title.textContent || '').trim()
      }

      let def = ''
      const $def = el.querySelector('[class^="word__defination--"]>object')
      if ($def) {
        $def.querySelectorAll('.crossreference').forEach($cf => {
          let word = ($cf.textContent || '').trim()
          $cf.outerHTML = `<a href="https://www.etymonline.com/word/${word}" target="_blank">${word}</a>`
        })
        def = DOMPurify.sanitize($def.innerHTML)
      }

      if (title && def) {
        return { title, href, def }
      }
    })
    .filter((r): r is EtymonlineResultItem => r as any as boolean)

  if (result.length > 0) {
    return { result }
  }

  return handleNoResult()
}
