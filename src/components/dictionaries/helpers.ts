import DOMPurify from 'dompurify'
import AxiosMockAdapter from 'axios-mock-adapter'
import { DictID, AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { Word } from '@/_helpers/record-manager'
import { chsToChz } from '@/_helpers/chs-to-chz'

/** Fetch and parse dictionary search result */
export interface SearchFunction<Result, Payload = {}> {
  (
    text: string,
    config: AppConfig,
    profile: Profile,
    payload: Readonly<Payload & { isPDF: boolean }>
  ): Promise<DictSearchResult<Result>>
}

export interface DictSearchResult<R> {
  /** search result */
  result: R
  /** auto play sound */
  audio?: {
    uk?: string
    us?: string
    py?: string
  }
}

/** Return a dictionary source page url for the dictionary header */
export interface GetSrcPageFunction {
  (text: string, config: AppConfig, profile: Profile): string
}

/**
 * For testing and storybook.
 *
 * Mock all the requests and returns all searchable texts.
 */
export interface MockRequest {
  (mock: AxiosMockAdapter): void
}

export type HTMLString = string

export interface ViewPorps<T> {
  result: T
  searchText: <P = { [index: string]: any }>(arg?: {
    id?: DictID
    word?: Word
    payload?: P
  }) => any
}

export type SearchErrorType = 'NO_RESULT' | 'NETWORK_ERROR'

export function handleNoResult<T = any>(): Promise<T> {
  return Promise.reject('NO_RESULT')
}

export function handleNetWorkError(): Promise<never> {
  return Promise.reject('NETWORK_ERROR')
}

export interface MachineTranslatePayload {
  sl?: string
  tl?: string
}

export interface MachineTranslateResult<ID extends DictID> {
  id: ID
  /** Source language */
  sl: string
  /** Target language */
  tl: string
  /** All supported languages */
  langcodes: ReadonlyArray<string>
  searchText: {
    text: string
    audio?: string
  }
  trans: {
    text: string
    audio?: string
  }
}

/**
 * Get the textContent of a node or its child.
 */
export function getText(
  parent: ParentNode,
  selector?: string,
  toChz?: boolean
): string
export function getText(
  parent: ParentNode,
  toChz?: boolean,
  selector?: string
): string
export function getText(
  parent: ParentNode,
  ...args: [string?, boolean?] | [boolean?, string?]
): string {
  let selector = ''
  let toChz = false
  for (let i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'string') {
      selector = args[i] as string
    } else if (typeof args[i] === 'boolean') {
      toChz = args[i] as boolean
    }
  }

  const child = selector ? parent.querySelector(selector) : parent
  if (!child) {
    return ''
  }

  const textContent = child['textContent'] || ''
  return toChz ? chsToChz(textContent) : textContent
}

export interface GetHTMLConfig {
  /** innerHTML or outerHTML */
  mode?: 'innerHTML' | 'outerHTML'
  /** Select child node */
  selector?: string
  /** to traditional Chinese */
  toChz?: boolean
  /** Give url and src a host */
  host?: string
  /** DOM Purify config */
  config?: DOMPurify.Config
}

const defaultDOMPurifyConfig: DOMPurify.Config = {
  FORBID_TAGS: ['style'],
  FORBID_ATTR: ['style']
}

export function getHTML(
  parent: ParentNode,
  {
    mode = 'innerHTML',
    selector,
    toChz,
    host,
    config = defaultDOMPurifyConfig
  }: GetHTMLConfig = {}
): string {
  const node = selector ? parent.querySelector<HTMLElement>(selector) : parent
  if (!node) {
    return ''
  }

  if (host) {
    const getFullLink = getFullLinkBuilder(host)

    function fillLink(el: HTMLElement) {
      el.setAttribute('href', getFullLink(el, 'href'))
      el.setAttribute('src', getFullLink(el, 'src'))
    }

    if (node['tagName'] === 'A' || node['tagName'] === 'IMG') {
      fillLink(node as HTMLElement)
    }
    node.querySelectorAll('a').forEach(fillLink)
    node.querySelectorAll('img').forEach(fillLink)
  }

  const fragment = DOMPurify.sanitize((node as unknown) as Node, {
    ...config,
    RETURN_DOM_FRAGMENT: true
  })

  const content = fragment.firstChild ? fragment.firstChild[mode] : ''

  return toChz ? chsToChz(content) : content
}

export function getInnerHTML(
  host: string,
  parent: ParentNode,
  selectorOrConfig: string | Omit<GetHTMLConfig, 'mode' | 'host'> = {}
) {
  return getHTML(
    parent,
    typeof selectorOrConfig === 'string'
      ? { selector: selectorOrConfig, host, mode: 'innerHTML' }
      : { ...selectorOrConfig, host, mode: 'innerHTML' }
  )
}

export function getOuterHTML(
  host: string,
  parent: ParentNode,
  selectorOrConfig: string | Omit<GetHTMLConfig, 'mode' | 'host'> = {}
) {
  return getHTML(
    parent,
    typeof selectorOrConfig === 'string'
      ? { selector: selectorOrConfig, host, mode: 'outerHTML' }
      : { ...selectorOrConfig, host, mode: 'outerHTML' }
  )
}

/**
 * Remove a child node from a parent node
 */
export function removeChild(parent: ParentNode, selector: string) {
  const child = parent.querySelector(selector)
  if (child) {
    child.remove()
  }
}

/**
 * Remove all the matching child nodes from a parent node
 */
export function removeChildren(parent: ParentNode, selector: string) {
  parent.querySelectorAll(selector).forEach(el => el.remove())
}

/**
 * HEX string to normal string
 */
export function decodeHEX(text: string): string {
  return text.replace(/\\x([0-9A-Fa-f]{2})/g, (m, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  )
}

/**
 * Will jump to the website instead of searching
 * when clicking on the dict panel
 */
export function externalLink($a: HTMLElement) {
  $a.setAttribute('target', '_blank')
  $a.setAttribute('rel', 'nofollow noopener noreferrer')
}

export function getFullLinkBuilder(host: string) {
  if (host.endsWith('/')) {
    host = host.slice(0, -1)
  }

  const protocol = host.startsWith('https') ? 'https:' : 'http:'

  return function getFullLink(element: Element, attr: string): string {
    const link = element.getAttribute(attr)
    if (!link) {
      return ''
    }

    if (link.startsWith('http')) {
      return link
    }

    if (link.startsWith('//')) {
      return protocol + link
    }

    if (link.startsWith('/')) {
      return host + link
    }

    return host + '/' + link
  }
}
