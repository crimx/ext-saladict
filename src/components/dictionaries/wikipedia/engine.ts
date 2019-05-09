import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { isContainJapanese, isContainChinese } from '@/_helpers/lang-check'
import {
  handleNoResult,
  handleNetWorkError,
  getOuterHTMLBuilder,
  SearchFunction,
  HTMLString,
  GetSrcPageFunction,
  getText,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { AllDicts } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const { lang } = profile.dicts.all.wikipedia.options
  const subdomain = getSubdomain(text, lang)
  const path = lang.startsWith('zh-') ? lang : 'wiki'
  return `https://${subdomain}.wikipedia.org/${path}/${encodeURIComponent(text)}`
}

export type LangListItem = {
  title: string
  url: string
}

export type LangList = LangListItem[]

export interface WikipediaResult {
  title: string
  content: HTMLString
  langSelector: string
}

type WikipediaSearchResult = DictSearchResult<WikipediaResult>

export type WikipediaPayload = {
  /** Search a specific url */
  url?: string
}

export const search: SearchFunction<WikipediaSearchResult, WikipediaPayload> = (
  text, config, profile, payload
) => {
  const { lang } = profile.dicts.all.wikipedia.options
  let subdomain = getSubdomain(text, lang)

  let url = payload.url
  if (url) {
    const matchSubdomain = url.match(/([^\/\.]+)\.m\.wikipedia\.org/)
    if (matchSubdomain) {
      subdomain = matchSubdomain[1]
    } else {
      url = url.replace(/^\//, `https://${subdomain}.m.wikipedia.org/`)
    }
  } else {
    const path = lang.startsWith('zh-') ? lang : 'wiki'
    url = `https://${subdomain}.m.wikipedia.org/${path}/${encodeURIComponent(text)}`
  }

  return fetchDirtyDOM(url)
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, subdomain))
}

export function fetchLangList (langSelector: string) {
  return fetchDirtyDOM(langSelector)
    .then(getLangList)
    .catch((e) => (console.log(e), []))
}

function handleDOM (
  doc: Document,
  subdomain: string,
): WikipediaSearchResult | Promise<WikipediaSearchResult> {
  const $bs = [...doc.querySelectorAll('#mf-section-0 b')]
  if ($bs.some($b => {
    const textContent = $b.textContent
    return textContent === `The article that you're looking for doesn't exist.` ||
           textContent === `维基百科目前还没有与上述标题相同的条目。`
  })) {
    return handleNoResult<WikipediaSearchResult>()
  }

  const title = getText(doc, '#section_0')
  if (!title) {
    return handleNoResult<WikipediaSearchResult>()
  }

  doc.querySelectorAll('#bodyContent .section-heading').forEach($header => {
    $header.classList.add('collapsible-heading')
    const $icon = $header.querySelector('.mw-ui-icon')
    if ($icon) {
      $icon.classList.add('mw-ui-icon-mf-arrow')
      $icon.classList.remove('mf-mw-ui-icon-rotate-flip')
    }
  })

  const getOuterHTML = getOuterHTMLBuilder(`https://${subdomain}.wikipedia.org/`, {})

  const content = getOuterHTML(doc, '#bodyContent')
  if (!content) {
    return handleNoResult<WikipediaSearchResult>()
  }

  let langSelector = ''
  let $langSelector = doc.querySelector('a.language-selector')
  if (!$langSelector) {
    $langSelector = doc.querySelector('.language-selector a')
  }
  if ($langSelector) {
    langSelector = ($langSelector.getAttribute('href') || '')
      .replace(/^\//, `https://${subdomain}.m.wikipedia.org/`)
  }

  return { result: { title, content, langSelector } }
}

function getSubdomain (
  text: string,
  lang: AllDicts['wikipedia']['options']['lang'],
): string {
  if (lang.startsWith('zh-')) {
    return 'zh'
  }

  if (lang === 'auto') {
    return isContainJapanese(text)
      ? 'ja'
      : isContainChinese(text)
        ? 'zh'
        : 'en'
  }

  return lang
}

function getLangList (doc: Document): LangList {
  return [...doc.querySelectorAll('#mw-content-text li a')]
    .map<LangListItem | undefined>($a => {
      const url = $a.getAttribute('href')
      const title = $a.getAttribute('title')
      if (url && title) {
        return { url, title }
      }
    })
    .filter((x): x is LangListItem => x as any as boolean)
}
