import axios, { AxiosResponse } from 'axios'
import { isContainJapanese, isContainChinese } from '@/_helpers/lang-check'
import {
  handleNoResult,
  handleNetWorkError,
  getOuterHTML,
  SearchFunction,
  HTMLString,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { AllDicts } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const { lang } = profile.dicts.all.wikipedia.options
  const subdomain = getSubdomain(text, lang)
  const path = lang.startsWith('zh-') ? lang : 'wiki'
  return `https://${subdomain}.wikipedia.org/${path}/${encodeURIComponent(
    text
  )}`
}

export type LangListItem = {
  title: string
  url: string
}

export type LangList = LangListItem[]

export interface WikipediaResult {
  title: string
  content: HTMLString
  langList: LangList
}

type WikipediaSearchResult = DictSearchResult<WikipediaResult>

export type WikipediaPayload = {
  /** Search a specific url */
  url?: string
}

export const search: SearchFunction<WikipediaResult, WikipediaPayload> = (
  text,
  config,
  profile,
  payload
) => {
  const { lang } = profile.dicts.all.wikipedia.options
  const target = getSearchTarget(payload.url, text, lang)

  return axios
    .get<WikipediaApiResponse>(getApiUrl(target.subdomain, target.title), {
      withCredentials: false
    })
    .catch(handleNetWorkError)
    .then(({ data }: AxiosResponse<WikipediaApiResponse>) =>
      handleApiResponse(data, target.subdomain)
    )
}

function getSubdomain(
  text: string,
  lang: AllDicts['wikipedia']['options']['lang']
): string {
  if (lang.startsWith('zh-')) {
    return 'zh'
  }

  if (lang === 'auto') {
    return isContainJapanese(text) ? 'ja' : isContainChinese(text) ? 'zh' : 'en'
  }

  return lang
}

type WikipediaApiResponse = {
  error?: {
    code?: string
    info?: string
  }
  parse?: {
    title?: string
    displaytitle?: string
    text?: string
    langlinks?: WikipediaLangLink[]
  }
}

type WikipediaLangLink = {
  url?: string
  langname?: string
  autonym?: string
  title?: string
}

function getSearchTarget(
  url: string | undefined,
  text: string,
  lang: AllDicts['wikipedia']['options']['lang']
): { subdomain: string; title: string } {
  if (!url) {
    return { subdomain: getSubdomain(text, lang), title: text }
  }

  const match = url.match(
    /^https?:\/\/([^/.]+)\.wikipedia\.org\/(?:wiki|[^/]+)\/([^#?]+)/
  )
  if (match) {
    return {
      subdomain: match[1],
      title: decodeURIComponent(match[2]).replace(/_/g, ' ')
    }
  }

  return { subdomain: getSubdomain(text, lang), title: url }
}

function getApiUrl(subdomain: string, title: string): string {
  return (
    `https://${subdomain}.wikipedia.org/w/api.php` +
    '?action=parse' +
    `&page=${encodeURIComponent(title)}` +
    '&prop=text|displaytitle|langlinks' +
    '&format=json' +
    '&formatversion=2' +
    '&redirects=1' +
    '&disableeditsection=1' +
    '&disabletoc=1'
  )
}

function handleApiResponse(
  data: WikipediaApiResponse,
  subdomain: string
): WikipediaSearchResult | Promise<WikipediaSearchResult> {
  if (data.error || !data.parse || !data.parse.text) {
    return handleNoResult<WikipediaSearchResult>(data.error)
  }

  const doc = new DOMParser().parseFromString(data.parse.text, 'text/html')
  const content = getOuterHTML(`https://${subdomain}.wikipedia.org/`, doc, {
    selector: '.mw-parser-output'
  })
  const title = getDisplayTitle(data.parse.displaytitle) || data.parse.title

  if (!title || !content) {
    return handleNoResult<WikipediaSearchResult>()
  }

  return {
    result: {
      title,
      content,
      langList: getLangList(data.parse.langlinks)
    }
  }
}

function getDisplayTitle(displaytitle?: string): string {
  if (!displaytitle) {
    return ''
  }

  return (
    new DOMParser().parseFromString(displaytitle, 'text/html').documentElement
      .textContent || ''
  )
}

function getLangList(langlinks: WikipediaLangLink[] = []): LangList {
  return langlinks
    .map<LangListItem | undefined>(item => {
      if (item.url && item.title) {
        return {
          url: item.url,
          title: item.langname
            ? `${item.langname} - ${item.title}`
            : item.autonym
            ? `${item.autonym} - ${item.title}`
            : item.title
        }
      }
    })
    .filter((x): x is LangListItem => !!x)
}
