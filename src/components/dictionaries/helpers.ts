import DOMPurify from 'dompurify'

export type HTMLString = string

export function handleNoResult<T> (): Promise<T> {
  return Promise.reject('No result')
}

export function getText (parent: ParentNode, selector?: string): string {
  const child = selector ? parent.querySelector(selector) : parent
  if (!child) { return '' }
  return child['textContent'] || ''
}

export function getInnerHTMLThunk (host?: string) {
  if (host && !host.endsWith('/')) {
    host = host + '/'
  }
  return function getInnerHTML (parent: ParentNode, selector?: string): HTMLString {
    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    const content = DOMPurify.sanitize(child['innerHTML'] || '')
    return host
      ? content.replace(/href="\//g, 'href="' + host)
      : content
  }
}

export function getOuterHTMLThunk (host?: string) {
  if (host && !host.endsWith('/')) {
    host = host + '/'
  }
  return function getOuterHTML (parent: ParentNode, selector?: string): HTMLString {
    const child = selector ? parent.querySelector(selector) : parent
    if (!child) { return '' }
    const content = DOMPurify.sanitize(child['outerHTML'] || '')
    return host
      ? content.replace(/href="\//g, 'href="' + host)
      : content
  }
}

export function removeChild (parent: ParentNode, selector: string) {
  const child = parent.querySelector(selector)
  if (child) { child.remove() }
}

export function removeChildren (parent: ParentNode, selector: string) {
  parent.querySelectorAll(selector).forEach(el => el.remove())
}
