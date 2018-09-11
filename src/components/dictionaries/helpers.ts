import DOMPurify from 'dompurify'

export type HTMLString = string

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

export interface MachineTranslateResult {
  searchText: {
    text: string
    audio?: string
  }
  trans: {
    text: string
    audio?: string
  }
}

export function getText (parent: ParentNode, selector?: string): string {
  const child = selector ? parent.querySelector(selector) : parent
  if (!child) { return '' }
  return child['textContent'] || ''
}

export function getInnerHTMLThunk (
  host?: string,
  DOMPurifyConfig?: DOMPurify.Config,
): (parent: ParentNode, selector?: string) => HTMLString
export function getInnerHTMLThunk (...args) {
  let host: string = typeof args[0] === 'string' ? args.shift() : ''
  let DOMPurifyConfig: DOMPurify.Config = Object(args[0]) === args[0] ? args.shift() : {
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  }

  if (host && !host.endsWith('/')) {
    host = host + '/'
  }
  return function getInnerHTML (parent: ParentNode, selector?: string): HTMLString {
    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    let purifyResult = DOMPurify.sanitize(child['outerHTML'] || '', DOMPurifyConfig)
    const content = typeof purifyResult === 'string'
      ? purifyResult
      : purifyResult['outerHTML']
        ? purifyResult['outerHTML']
        : purifyResult.firstElementChild
          ? purifyResult.firstElementChild.outerHTML
          : ''
    return host
      ? content.replace(/href="\/[^/]/g, 'href="' + host)
      : content
  }
}

export function getOuterHTMLThunk (host?: string, DOMPurifyConfig?: DOMPurify.Config)
export function getOuterHTMLThunk (...args) {
  let host: string = typeof args[0] === 'string' ? args.shift() : ''
  let DOMPurifyConfig: DOMPurify.Config = Object(args[0]) === args[0] ? args.shift() : {
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  }

  if (host && !host.endsWith('/')) {
    host = host + '/'
  }
  return function getOuterHTML (parent: ParentNode, selector?: string): HTMLString {
    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    let purifyResult = DOMPurify.sanitize(child['innerHTML'] || '', DOMPurifyConfig)
    const content = typeof purifyResult === 'string'
      ? purifyResult
      : purifyResult['outerHTML']
        ? purifyResult['outerHTML']
        : purifyResult.firstElementChild
          ? purifyResult.firstElementChild.outerHTML
          : ''
    return host
      ? content.replace(/href="\/[^/]/g, 'href="' + host)
      : content
  }
}

export function decodeHEX (text: string): string {
  return text.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (m, p1) => String.fromCharCode(parseInt(p1, 16)),
  )
}

export function removeChild (parent: ParentNode, selector: string) {
  const child = parent.querySelector(selector)
  if (child) { child.remove() }
}

export function removeChildren (parent: ParentNode, selector: string) {
  parent.querySelectorAll(selector).forEach(el => el.remove())
}
