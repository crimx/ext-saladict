import DOMPurify from 'dompurify'

export function fetchDOM (input?: string | Request, init?: RequestInit): Promise<DocumentFragment> {
  return fetch(input, init)
    .then(r => r.text())
    .then(text => DOMPurify.sanitize(text, { RETURN_DOM_FRAGMENT: true }))
}

/** about 6 time faster as it typically takes less than 5ms to parse a DOM */
export function fetchDirtyDOM (input?: string | Request, init?: RequestInit): Promise<Document> {
  return fetch(input, init)
    .then(r => r.text())
    .then(text => new DOMParser().parseFromString(
      text,
      'text/html',
    ))
}
