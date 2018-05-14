import DOMPurify from 'dompurify'

export function fetchDOM (input?: string | Request, init?: RequestInit): Promise<Document> {
  return fetch(input, init)
    .then(r => r.text())
    .then(text => new DOMParser().parseFromString(
      DOMPurify.sanitize(text),
      'text/html',
    ))
}

export function fetchDirtyDOM (input?: string | Request, init?: RequestInit): Promise<Document> {
  return fetch(input, init)
    .then(r => r.text())
    .then(text => new DOMParser().parseFromString(
      text,
      'text/html',
    ))
}
