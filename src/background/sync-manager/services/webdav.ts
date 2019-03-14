import {
  NotebookFile,
  UploadConfig,
  DownloadConfig,
  SyncService,
} from '../interface'
import {
  getNotebook,
  setNotebook,
  createSyncConfigStream,
  setMeta,
  getMeta,
  setSyncConfig,
  getSyncConfig,
} from '../helpers'

import { empty } from 'rxjs/observable/empty'
import { of } from 'rxjs/observable/of'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { switchMap } from 'rxjs/operators/switchMap'
import { delay } from 'rxjs/operators/delay'
import { repeat } from 'rxjs/operators/repeat'
import { Mutable } from '@/typings/helpers'

export interface SyncConfig {
  /** Server address. Ends with '/'. */
  readonly url: string
  readonly user: string
  readonly passwd: string
  /** In min */
  readonly duration: number
}

export interface SyncMeta {
  readonly etag?: string
  readonly timestamp?: number
}

export class Service extends SyncService<SyncConfig, SyncMeta> {
  static readonly id = 'webdav'

  static readonly title = {
    'en': 'WebDAV',
    'zh-CN': 'WebDAV',
    'zh-TW': 'WebDAV',
  }

  config = Service.getDefaultConfig()

  meta: SyncMeta = {}

  static getDefaultConfig (): SyncConfig {
    return {
      url: '',
      user: '',
      passwd: '',
      duration: 15,
    }
  }

  startInterval () {
    getMeta(Service.id).then(meta => {
      if (meta) {
        this.meta = meta
      }

      createSyncConfigStream<SyncConfig>(Service.id).pipe(
        switchMap(newConfig => {
          if (!newConfig) {
            this.config = Service.getDefaultConfig()
            return empty<void>()
          }

          if (typeof newConfig.url === 'string' && !newConfig.url.endsWith('/')) {
            (newConfig as Mutable<SyncConfig>).url += '/'
          }

          this.config = newConfig

          return of('').pipe(
            delay(newConfig.duration * 60000),
            switchMap(() => fromPromise<void>(this.download({}).catch(() => {/* nothing */}))),
            repeat(),
          )
        })
      ).subscribe()
    })
  }

  /**
   * Check server and create a Saladict Directory if not exist.
   */
  async init (config: Readonly<SyncConfig>) {
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
          return Promise.reject('unauthorized')
        }
        throw new Error()
      }
      var text = await response.text()
    } catch (e) {
      return Promise.reject('network')
    }

    try {
      if (!text) { throw new Error() }
      var doc = new DOMParser().parseFromString(text, 'text/xml')
      if (!doc) { throw new Error() }
    } catch (e) {
      return Promise.reject('parse')
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
          return Promise.reject('dir')
        }
      }
    }

    if (!dir) {
      // create directory
      const response = await fetch(config.url + 'Saladict', { method: 'MKCOL' })
      if (!response.ok) {
        // cannot create directory
        return Promise.reject('mkcol')
      }
    }

    await this.setConfig(config)
    await this.setMeta({})

    if (dir) {
      try {
        await this.download({ testConfig: config, noCache: true })
        // An old file exists on server.
        // Let user decide whether to upload.
        return Promise.reject('exist')
      } catch (e) {/* nothing */}
    }
  }

  async upload ({ force }: UploadConfig) {
    if (!this.config.url) {
      if (process.env.DEV_BUILD) {
        console.warn(`sync service ${Service.id} upload: empty url`)
      }
      return
    }

    if (!force) {
      await this.download({})
    }

    const words = await getNotebook()
    if (!words || words.length <= 0) { return }

    const timestamp = Date.now()

    try {
      var body = JSON.stringify({ timestamp, words } as NotebookFile)
    } catch (e) {
      if (process.env.DEV_BUILD) {
        console.error('WebDAV: Stringify notebook failed', words)
      }
      return Promise.reject('parse')
    }

    try {
      const response = await fetch(this.config.url + 'Saladict/notebook.json', {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + window.btoa(`${this.config.user}:${this.config.passwd}`),
        },
        body,
      })
      if (!response.ok) {
        throw new Error()
      }
    } catch (e) {
      if (process.env.DEV_BUILD) {
        console.error('WebDAV: upload failed', e)
      }
      return Promise.reject('network')
    }

    await this.setMeta({ timestamp, etag: '' })
  }

  async download ({ testConfig, noCache }: DownloadConfig) {
    const config = testConfig || this.config

    if (!config.url) {
      if (process.env.DEV_BUILD) {
        console.warn(`sync service ${Service.id} download: empty url`)
      }
      return
    }

    const headers = {
      'Authorization': 'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
    }
    if (!testConfig && !noCache && this.meta.etag != null) {
      headers['If-None-Match'] = this.meta.etag
      headers['If-Modified-Since'] = this.meta.etag
    }

    try {
      var response = await fetch(
        config.url + (config.url.endsWith('/') ? '' : '/') + 'Saladict/notebook.json',
        {
          method: 'GET',
          headers,
        }
      )

      if (response.status === 304) {
        return
      }

      if (!response.ok) {
        throw new Error()
      }
    } catch (e) {
      return Promise.reject('network')
    }

    try {
      var json: NotebookFile = await response.json()
    } catch (e) {
      if (process.env.DEV_BUILD) {
        console.error('Fetch webdav notebook.json error', response)
      }
      return Promise.reject('parse')
    }

    if (!Array.isArray(json.words) || json.words.some(w => !w.date)) {
      if (process.env.DEV_BUILD) {
        console.error('Parse webdav notebook.json error: incorrect words', json)
      }
      return Promise.reject('format')
    }

    if (!noCache && this.meta.timestamp) {
      if (!json.timestamp) {
        if (process.env.DEV_BUILD) {
          console.error('webdav notebook.json no timestamp', json)
        }
        return Promise.reject('timestamp')
      }

      if (!testConfig) {
        if (json.timestamp === this.meta.timestamp && !this.meta.etag) {
          await this.setMeta({
            timestamp: json.timestamp,
            etag: response.headers.get('ETag') || '',
          })
        }
      }

      if (json.timestamp <= this.meta.timestamp!) {
        // older file
        return
      }

    }

    if (process.env.DEV_BUILD) {
      if (!response.headers.get('ETag')) {
        console.warn('webdav notebook.json no etag', response)
      }
    }

    if (!testConfig) {
      await this.setMeta({
        timestamp: json.timestamp,
        etag: response.headers.get('ETag') || '',
      })

      await setNotebook(json.words)
    }
  }

  setMeta (meta: SyncMeta) {
    this.meta = meta
    return setMeta(Service.id, meta)
  }

  async getMeta () {
    const meta = await getMeta<SyncMeta>(Service.id)
    this.meta = meta || {} as SyncMeta
  }

  setConfig (config: SyncConfig) {
    this.config = config
    return setSyncConfig(Service.id, config)
  }

  async getConfig () {
    const config = await getSyncConfig(Service.id)
    return config || Service.getDefaultConfig()
  }
}
