import {
  NotebookFile,
  InitServer,
  Upload,
  DlChanged,
  setMeta,
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
  config, meta, force
) => {
  const headers = {
    'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
  }
  if (!force && meta.etag != null) {
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

  if (!force && meta.timestamp) {
    if (!json.timestamp) {
      if (process.env.DEV_BUILD) {
        console.error('webdav notebook.json no timestamp', json)
      }
      return
    }

    if (json.timestamp === meta.timestamp && !meta.etag) {
      setMeta<Required<Meta>>(serviceID, {
        timestamp: json.timestamp,
        etag: response.headers.get('ETag') || '',
      })
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

export const initServer: InitServer<SyncConfig> = async config => {
  let text: string

  try {
    const response = await fetch(config.url, {
      method: 'PROPFIND',
      headers: {
        'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
        'Content-Type': 'application/xml; charset="utf-8"',
        'Depth': '1',
      },
    })
    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' }
      }
      throw new Error()
    }
    text = await response.text()
  } catch (e) {
    return { error: 'network' }
  }

  let doc: Document

  try {
    if (!text) { throw new Error() }
    doc = new DOMParser().parseFromString(text, 'text/xml')
    if (!doc) { throw new Error() }
  } catch (e) {
    return { error: 'parse' }
  }

  let dir = false
  const $responses = Array.from(doc.querySelectorAll('response'))
  for (let i in $responses) {
    const href = $responses[i].querySelector('href')
    if (href && href.textContent && href.textContent.endsWith('/Saladict/')) {
      // is Saladict
      if ($responses[i].querySelector('resourcetype collection')) {
        // is collection
        dir = true
        break
      } else {
        return { error: 'dir' }
      }
    }
  }

  if (!dir) {
    // create directory
    const response = await fetch(config.url + 'Saladict', { method: 'MKCOL' })
    if (!response.ok) {
      // cannot create directory
      return { error: 'mkcol' }
    }
    return {}
  }

  if (await dlChanged(config, {})) {
    // let user decide whether to upload
    return { error: 'exist' }
  }

  return {}
}
