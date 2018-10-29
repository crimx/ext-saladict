import {
  NotebookFile,
  InitServer,
  Upload,
  DlChanged,
  setMeta,
  getNotebook,
} from '../helpers'

export interface SyncConfig {
  /** Server address. Ends with '/'. */
  readonly url: string
  readonly user: string
  readonly passwd: string
  /** In ms */
  readonly duration: number
}

export interface Meta {
  readonly etag?: string
  readonly timestamp?: number
}

export const serviceID = 'webdav'

export const initServer: InitServer<SyncConfig> = async config => {
  const text = await fetch(config.url, {
    method: 'PROPFIND',
    headers: {
      'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
      'Content-Type': 'application/xml; charset="utf-8"',
      'Depth': '2',
    },
  }).then(r => r.text())

  const doc = new DOMParser().parseFromString(text, 'application/xml')

  const dir = Array.from(doc.querySelectorAll('response'))
    .find(el => {
      const href = el.querySelector('href')
      if (href && href.textContent && href.textContent.endsWith('/Saladict/')) {
        // is Saladict
        if (el.querySelector('resourcetype collection')) {
          // is collection
          return true
        }
      }
      return false
    })

  if (!dir) {
    // create directory
    const response = await fetch(config.url + 'Saladict', { method: 'MKCOL' })
    if (!response.ok) {
      // cannot create directory
      return Promise.reject('mkcol')
    }
    return true
  }

  const file = await dlChanged(config, {})
  if (file) {
    // file exist
    // remind use for overwriting
    return Promise.reject('exist')
  }

  const words = await getNotebook()
  return true
}

export const upload: Upload<SyncConfig> = async (config, text) => {
  const response = await fetch(config.url + 'Saladict/notebook.json', {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
    },
    body: text,
  })

  return response.ok
}

export const dlChanged: DlChanged<SyncConfig, Meta> = async (
  config, meta
) => {
  const headers = {
    'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
  }
  if (meta.etag != null) {
    headers['If-None-Match'] = meta.etag
    headers['If-Modified-Since'] = meta.etag
  }

  const response = await fetch(config.url + 'Saladict/notebook.json', {
    method: 'GET',
    headers,
  })

  if (response.status === 304) {
    return
  }

  let json: NotebookFile
  try {
    json = await response.json()
  } catch (e) {
    if (process.env.DEV_BUILD) {
      console.error('Fetch webdav notebook.json error', response)
    }
    return
  }

  if (!Array.isArray(json.words) || json.words.some(w => !w.date)) {
    if (process.env.DEV_BUILD) {
      console.error('Parse webdav notebook.json error: incorrect words', json)
    }
    return
  }

  if (meta.timestamp) {
    if (!json.timestamp) {
      if (process.env.DEV_BUILD) {
        console.error('webdav notebook.json no timestamp', json)
      }
      return
    }

    if (json.timestamp <= meta.timestamp) {
      // older file
      return
    }
  }

  if (process.env.DEV_BUILD) {
    if (!response.headers.get('ETag')) {
      console.warn('webdav notebook.json no etag', response)
    }
  }

  return { json, etag: response.headers.get('ETag') || '' }
}
