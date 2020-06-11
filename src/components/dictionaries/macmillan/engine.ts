import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  externalLink,
  DictSearchResult,
  removeChildren,
  getText,
  removeChild,
  getFullLink,
  getOuterHTML
} from '../helpers'
import { DictConfigs } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const lang =
    profile.dicts.all.macmillan.options.locale === 'us' ? 'american' : 'british'
  return (
    `http://www.macmillandictionary.com/dictionary/${lang}/` +
    encodeURIComponent(text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
  )
}

const HOST = 'http://www.macmillandictionary.com'

export interface MacmillanResultLex {
  type: 'lex'
  title: string
  senses: HTMLString
  /** part of speech */
  pos?: string
  /** syntax coding */
  sc?: string
  phsym?: string
  pron?: string
  ratting?: number
  toggleables: HTMLString[]
  relatedEntries: Array<{
    title: string
    href: string
  }>
}

export interface MacmillanResultRelated {
  type: 'related'
  list: Array<{
    title: string
    href: string
  }>
}

export type MacmillanResult = MacmillanResultLex | MacmillanResultRelated

type MacmillanSearchResult = DictSearchResult<MacmillanResult>

export interface MacmillanPayload {
  href?: string
}

export const search: SearchFunction<MacmillanResult, MacmillanPayload> = async (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.macmillan.options

  return fetchMacmillanDom(
    payload.href || (await getSrcPage(text, config, profile))
  )
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options))
}

async function checkResult(
  doc: Document,
  options: DictConfigs['macmillan']['options']
): Promise<MacmillanSearchResult> {
  if (doc.querySelector('.senses')) {
    return handleDOM(doc)
  } else if (options.related) {
    const alternatives = [
      ...doc.querySelectorAll<HTMLAnchorElement>('.display-list li a')
    ].map($a => ({
      title: getText($a),
      href: getFullLink(HOST, $a, 'href')
    }))
    if (alternatives.length > 0) {
      return {
        result: {
          type: 'related',
          list: alternatives
        }
      }
    }
  }
  return handleNoResult()
}

function handleDOM(
  doc: Document
): MacmillanSearchResult | Promise<MacmillanSearchResult> {
  const $entry = doc.querySelector('#entryContent .left-content')
  if (!$entry) {
    return handleNoResult()
  }

  const result: MacmillanResultLex = {
    type: 'lex',
    title: getText($entry, '.big-title .BASE'),
    senses: '',
    toggleables: [],
    relatedEntries: []
  }

  if (!result.title) {
    return handleNoResult()
  }

  $entry
    .querySelectorAll<HTMLAnchorElement>('a.moreButton')
    .forEach(externalLink)

  result.senses = getInnerHTML(HOST, $entry, '.senses')

  if (!result.senses) {
    return handleNoResult()
  }

  removeChild($entry, '.senses')

  result.pos = getText($entry, '.entry-pron-head .PART-OF-SPEECH')
  result.sc = getText($entry, '.entry-pron-head .SYNTAX-CODING')
  result.phsym = getText($entry, '.entry-pron-head .PRON')
  result.ratting = $entry.querySelectorAll('.entry-red-star').length

  $entry.querySelectorAll('.toggleable').forEach($toggleable => {
    result.toggleables.push(getOuterHTML(HOST, $toggleable))
  })

  doc
    .querySelectorAll<HTMLAnchorElement>('.related-entries-item a')
    .forEach($a => {
      const $pos = $a.querySelector('.PART-OF-SPEECH')
      if ($pos) {
        $pos.textContent = getText($pos).toUpperCase()
      }

      result.relatedEntries.push({
        title: getText($a),
        href: getFullLink(HOST, $a, 'href')
      })
    })

  const audio: { uk?: string } = {}

  const $sound = $entry.querySelector<HTMLDivElement>(
    '.entry-pron-head .PRONS .sound'
  )
  if ($sound && $sound.dataset.srcMp3) {
    result.pron = $sound.dataset.srcMp3
    audio.uk = result.pron
  }

  return { result, audio }
}

async function fetchMacmillanDom(url: string): Promise<Document> {
  const doc = await fetchDirtyDOM(url)
  removeChildren(doc, '.visible-xs')
  return doc
}
