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
  parseLegacyItems(doc, options, result, catalog)
  if (result.length === 0) {
    parseModernEntries(doc, options, result, catalog)
  }
  if (result.length === 0) {
    parseModernSearchCards(doc, options, result, catalog)
  }

  if (result.length > 0) {
    return { result, catalog }
  }

  return handleNoResult()
}

function parseLegacyItems(
  doc: Document,
  options: DictConfigs['etymonline']['options'],
  result: EtymonlineResult,
  catalog: NonNullable<EtymonlineSearchResult['catalog']>
) {
  const $items = Array.from(doc.querySelectorAll('[class*="word--"]'))

  for (let i = 0; i < $items.length && result.length < options.resultnum; i++) {
    const $item = $items[i]

    const title = getText($item, '[class*="word__name--"]').trim()
    if (!title) {
      continue
    }

    const $def = $item.querySelector('[class*="word__defination--"]>*')
    const def = getDefinitionHTML(doc, $def)
    if (!def) {
      continue
    }

    pushResult(result, catalog, {
      title,
      def,
      href: getFullLink(HOST, $item, 'href'),
      chart: options.chart
        ? getChartLink($item.querySelector('[class*="chart--"] img'))
        : ''
    })
  }
}

function parseModernSearchCards(
  doc: Document,
  options: DictConfigs['etymonline']['options'],
  result: EtymonlineResult,
  catalog: NonNullable<EtymonlineSearchResult['catalog']>
) {
  const $links = Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('a.w-full.group[href]')
  )

  for (let i = 0; i < $links.length && result.length < options.resultnum; i++) {
    const $link = $links[i]
    const $title = $link.querySelector<HTMLElement>('[id]') || $link
    const $card = $link.closest<HTMLElement>('div[tabindex="-1"]')
    const $def = $card?.querySelector<HTMLElement>('section[class*="prose"]')
    const title = getSpacedText($title)
    const def = getDefinitionHTML(doc, $def)

    if (!title || !def) {
      continue
    }

    pushResult(result, catalog, {
      title,
      def,
      href: appendHash(getFullLink(HOST, $link, 'href'), $title.id),
      chart:
        options.chart && $card
          ? getChartLink($card.querySelector('img[src*="chart/"]'))
          : ''
    })
  }
}

function parseModernEntries(
  doc: Document,
  options: DictConfigs['etymonline']['options'],
  result: EtymonlineResult,
  catalog: NonNullable<EtymonlineSearchResult['catalog']>
) {
  const canonical = doc
    .querySelector('link[rel="canonical"]')
    ?.getAttribute('href')
  const $sections = Array.from(doc.querySelectorAll<HTMLElement>('section.max-w-none'))

  for (
    let i = 0;
    i < $sections.length && result.length < options.resultnum;
    i++
  ) {
    const $section = $sections[i]
    const $title = $section.querySelector<HTMLElement>('h2')
    const $def = Array.from($section.children).find(
      ($child): $child is HTMLElement => $child.tagName === 'SECTION'
    )
    const title = getSpacedText($title)
    const def = getDefinitionHTML(doc, $def)

    if (!$title || !title || !def) {
      continue
    }

    pushResult(result, catalog, {
      title,
      def,
      href: appendHash(canonical, $title.id),
      chart: options.chart
        ? getChartLink($section.querySelector('img[src*="chart/"]'))
        : ''
    })
  }
}

function getDefinitionHTML(doc: Document, $def?: ParentNode | null) {
  if (!$def) {
    return ''
  }

  normalizeCrossReferences(doc, $def)
  return getInnerHTML(HOST, $def)
}

function normalizeCrossReferences(doc: Document, $root: ParentNode) {
  $root.querySelectorAll('.crossreference').forEach($cf => {
    if ($cf.tagName.toLowerCase() === 'a') {
      return
    }

    const word = getText($cf).trim()
    if (!word) {
      return
    }

    const $a = doc.createElement('a')
    $a.target = '_blank'
    $a.href = `https://www.etymonline.com/word/${word}`
    $a.textContent = word

    $cf.replaceWith($a)
  })
}

function getSpacedText($node?: Element | null) {
  if (!$node) {
    return ''
  }

  const parts = Array.from($node.childNodes)
    .map($child => ($child.textContent || '').trim())
    .filter(Boolean)

  return (parts.length > 0 ? parts.join(' ') : getText($node))
    .replace(/\s+/g, ' ')
    .trim()
}

function appendHash(href: string | null | undefined, hash: string) {
  if (!href) {
    return ''
  }
  if (!hash || href.includes('#')) {
    return href
  }
  return `${href}#${hash}`
}

function getChartLink($chart?: Element | null) {
  return $chart ? getFullLink(HOST, $chart, 'src') : ''
}

function pushResult(
  result: EtymonlineResult,
  catalog: NonNullable<EtymonlineSearchResult['catalog']>,
  item: Omit<EtymonlineResultItem, 'id'>
) {
  const index = result.length
  const id = `d-etymonline-entry${index}`

  result.push({ id, ...item })
  catalog.push({
    key: `#${index}`,
    value: id,
    label: `#${item.title}`
  })
}
