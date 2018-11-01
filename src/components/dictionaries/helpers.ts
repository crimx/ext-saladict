import DOMPurify from 'dompurify'
import { TranslationFunction } from 'i18next'
import { DictID, AppConfig } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { chsToChz } from '@/_helpers/chs-to-chz'

export interface SearchFunction<Result, Payload = {}> {
  (text: string, config: AppConfig, payload: Payload): Promise<Result>
}

export type HTMLString = string

export interface ViewPorps<T> {
  result: T
  t: TranslationFunction
  searchText: (arg?: { id?: DictID, info?: SelectionInfo, payload?: { [index: string]: any } }) => any
  recalcBodyHeight: () => void
}

export const enum SearchErrorType {
  NoResult,
  NetWorkError,
}

export function handleNoResult<T> (): Promise<T> {
  return Promise.reject(SearchErrorType.NoResult)
}

export function handleNetWorkError (): Promise<never> {
  return Promise.reject(SearchErrorType.NetWorkError)
}

export interface MachineTranslatePayload {
  sl?: string
  tl?: string
}

export interface MachineTranslateResult {
  id: DictID
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
export function getText (parent: ParentNode, selector?: string, toChz?: boolean): string
export function getText (parent: ParentNode, toChz?: boolean, selector?: string): string
export function getText (parent: ParentNode, ...args): string {
  let selector = ''
  let toChz = false
  for (let i = args.length; i >= 0; i--) {
    if (typeof args[i] === 'string') {
      selector = args[i]
    } else if (typeof args[i] === 'boolean') {
      toChz = args[i]
    }
  }

  const child = selector ? parent.querySelector(selector) : parent
  if (!child) { return '' }
  const textContent = child['textContent'] || ''
  return toChz ? chsToChz(textContent) : textContent
}

interface GetHTML {
  (parent: ParentNode, selector?: string, toChz?: boolean): HTMLString
  (parent: ParentNode, toChz?: boolean, selector?: string): HTMLString
}

/**
 * Return a function that can get inner HTML from a node or its child.
 *
 * @param host - repleace the relative href
 * @param DOMPurifyConfig - config for DOM Purify
 */
export function getInnerHTMLThunk (host?: string, DOMPurifyConfig?: DOMPurify.Config): GetHTML
export function getInnerHTMLThunk (...args) {
  let host: string = typeof args[0] === 'string' ? args.shift() : ''
  let DOMPurifyConfig: DOMPurify.Config = Object(args[0]) === args[0] ? args.shift() : {
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  }

  if (host && !host.endsWith('/')) {
    host = host + '/'
  }

  const getInnerHTML: GetHTML = (parent: ParentNode, ...args): HTMLString => {
    let selector = ''
    let toChz = false
    for (let i = args.length; i >= 0; i--) {
      if (typeof args[i] === 'string') {
        selector = args[i]
      } else if (typeof args[i] === 'boolean') {
        toChz = args[i]
      }
    }

    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    let purifyResult = DOMPurify.sanitize(child['innerHTML'] || '', DOMPurifyConfig)
    let content = typeof purifyResult === 'string'
      ? purifyResult
      : purifyResult['outerHTML']
        ? purifyResult['outerHTML']
        : purifyResult.firstElementChild
          ? purifyResult.firstElementChild.outerHTML
          : ''
    content = host
      ? content.replace(/href="\/[^/]/g, 'href="' + host)
      : content
    return toChz ? chsToChz(content) : content
  }

  return getInnerHTML
}

/**
 * Return a function that can get outer HTML from a node or its child.
 *
 * @param host - repleace the relative href
 * @param DOMPurifyConfig - config for DOM Purify
 */
export function getOuterHTMLThunk (host?: string, DOMPurifyConfig?: DOMPurify.Config): GetHTML
export function getOuterHTMLThunk (...args) {
  let host: string = typeof args[0] === 'string' ? args.shift() : ''
  let DOMPurifyConfig: DOMPurify.Config = Object(args[0]) === args[0] ? args.shift() : {
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  }

  if (host && !host.endsWith('/')) {
    host = host + '/'
  }

  const getOuterHTML: GetHTML = (parent: ParentNode, ...args): HTMLString => {
    let selector = ''
    let toChz = false
    for (let i = args.length; i >= 0; i--) {
      if (typeof args[i] === 'string') {
        selector = args[i]
      } else if (typeof args[i] === 'boolean') {
        toChz = args[i]
      }
    }

    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    let purifyResult = DOMPurify.sanitize(child['outerHTML'] || '', DOMPurifyConfig)
    let content = typeof purifyResult === 'string'
      ? purifyResult
      : purifyResult['outerHTML']
        ? purifyResult['outerHTML']
        : purifyResult.firstElementChild
          ? purifyResult.firstElementChild.outerHTML
          : ''
    content = host
      ? content.replace(/href="\/[^/]/g, 'href="' + host)
      : content
    return toChz ? chsToChz(content) : content
  }

  return getOuterHTML
}

/**
 * Remove a child node from a parent node
 */
export function removeChild (parent: ParentNode, selector: string) {
  const child = parent.querySelector(selector)
  if (child) { child.remove() }
}

/**
 * Remove all the matching child nodes from a parent node
 */
export function removeChildren (parent: ParentNode, selector: string) {
  parent.querySelectorAll(selector).forEach(el => el.remove())
}

/**
 * HEX string to normal string
 */
export function decodeHEX (text: string): string {
  return text.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (m, p1) => String.fromCharCode(parseInt(p1, 16)),
  )
}
