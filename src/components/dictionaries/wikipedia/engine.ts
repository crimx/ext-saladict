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
import { AppConfig } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = (text, config) => {
  const { lang } = config.dicts.all.wikipedia.options
  const subdomain = getSubdomain(text, lang)
  const path = lang.startsWith('zh-') ? lang : 'wiki'
  return `https://${subdomain}.wikipedia.org/${path}/${encodeURIComponent(text)}`
}

type LangListItem = {
  title: string
  url: string
}
type LangList = LangListItem[]

export interface WikipediaResult {
  title: string
  content: HTMLString
  langSelector: string
  langList?: LangList
}

type WikipediaSearchResult = DictSearchResult<WikipediaResult>

export type WikipediaPayload = {
  /** Fetch lang list */
  fetchLangs?: false
  /** Search a specific url */
  url?: string
} | {
  fetchLangs: true
  result: WikipediaResult
}

export const search: SearchFunction<WikipediaSearchResult, WikipediaPayload> = (
  text, config, payload
) => {
  if (payload.fetchLangs) {
    return fetchDirtyDOM(payload.result.langSelector)
      .then(getLangList)
      .catch((e) => (console.log(e), []))
      .then(langList => ({ result: { ...payload.result, langList } }))
  }

  const { lang } = config.dicts.all.wikipedia.options
  const subdomain = getSubdomain(text, lang)

  let url = payload.url
  if (url) {
    url = url.replace(/^\//, `https://${subdomain}.m.wikipedia.org/`)
  } else {
    const path = lang.startsWith('zh-') ? lang : 'wiki'
    url = `https://${subdomain}.m.wikipedia.org/${path}/${encodeURIComponent(text)}`
  }

  return fetchDirtyDOM(url)
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, subdomain))
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
  const $langSelector = doc.querySelector('.language-selector a')
  if ($langSelector) {
    langSelector = $langSelector.getAttribute('href') || ''
    langSelector = langSelector.replace(/^\//, `https://${subdomain}.m.wikipedia.org/`)
  }

  return { result: { title, content, langSelector } }
}

function getSubdomain (
  text: string,
  lang: AppConfig['dicts']['all']['wikipedia']['options']['lang'],
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
