import {
  NotebookFile,
  AddConfig,
  DownloadConfig,
  SyncService,
  SyncServiceConfigBase
} from '../../interface'
import {
  getNotebook,
  setNotebook,
  setMeta,
  getMeta,
  setSyncConfig,
  notifyError
} from '../../helpers'

import { Mutable } from '@/typings/helpers'
import { storage } from '@/_helpers/browser-api'

export interface SyncConfig extends SyncServiceConfigBase {
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

  static getDefaultConfig(): SyncConfig {
    return {
      enable: false,
      url: '',
      user: '',
      passwd: '',
      duration: 15
    }
  }

  meta: SyncMeta = {}

  async startInterval() {
    if (process.env.DEBUG) {
      console.log(`Sync Service WebDAV starts interval.`)
    }

    if (!this.config.enable) {
      if (process.env.DEBUG) {
        console.warn(`Sync Service WebDAV already started.`)
      }
      return
    }

    this.meta = (await getMeta(Service.id)) || this.meta

    await browser.alarms.clear('webdav')

    browser.alarms.onAlarm.addListener(this.handleSyncAlarm)

    if (typeof this.config.url === 'string' && !this.config.url.endsWith('/')) {
      ;(this.config as Mutable<SyncConfig>).url += '/'
    }

    if (this.config.url) {
      const duration = +this.config.duration || 15
      const now = Date.now()
      let nextInterval: number = +(await storage.local.get('webdavInterval'))
        .webdavInterval
      if (
        !nextInterval ||
        nextInterval < now ||
        now + duration * 60000 < nextInterval
      ) {
        nextInterval = now + 1000
      }
      await storage.local.set({ webdavInterval: nextInterval })
      browser.alarms.create('webdav', {
        when: nextInterval,
        periodInMinutes: duration
      })
    } else {
      await storage.local.set({ webdavInterval: 0 })
    }
  }

  handleSyncAlarm = async (alarm: browser.alarms.Alarm) => {
    if (alarm.name !== 'webdav') {
      return
    }

    if (process.env.DEBUG) {
      console.log('Sync Service WebDAV Interval Alarm triggered.')
    }

    try {
      await this.download({})
    } catch (e) {
      console.error(e)
      notifyError(Service.id, 'download')
    }

    const duration = this.config.duration * 60000 || 15 * 60000
    await storage.local.set({ webdavInterval: Date.now() + duration })
  }

  /**
   * Check server and create a Saladict Directory if not exist.
   */
  async init() {
    try {
      const response = await fetch(this.config.url, {
        method: 'PROPFIND',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${this.config.user}:${this.config.passwd}`),
          'Content-Type': 'application/xml; charset="utf-8"',
          Depth: '1'
        }
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
      if (!text) {
        throw new Error()
      }
      var doc = new DOMParser().parseFromString(text, 'text/xml')
      if (!doc) {
        throw new Error()
      }
    } catch (e) {
      return Promise.reject('parse')
    }

    let dir = false
    const $responses = Array.from(doc.querySelectorAll('response'))
    for (const i in $responses) {
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
      const response = await fetch(this.config.url + 'Saladict', {
        method: 'MKCOL',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${this.config.user}:${this.config.passwd}`)
        }
      })
      if (!response.ok) {
        // cannot create directory
        return Promise.reject('mkcol')
      }
    }

    await setSyncConfig<SyncConfig>(Service.id, this.config)
    await this.setMeta({})

    if (dir) {
      try {
        await this.download({ testConfig: this.config, noCache: true })
        // An old file exists on server.
        // Let user decide whether to upload.
        return Promise.reject('exist')
      } catch (e) {
        /* nothing */
      }
    }
  }

  async add({ force }: AddConfig) {
    if (!this.config.url) {
      if (process.env.DEBUG) {
        console.warn(`sync service ${Service.id} upload: empty url`)
      }
      return
    }

    if (!force) {
      await this.download({})
    }

    const words = await getNotebook()
    if (!words || words.length <= 0) {
      return
    }

    const timestamp = Date.now()

    try {
      var body = JSON.stringify({ timestamp, words } as NotebookFile)
    } catch (e) {
      if (process.env.DEBUG) {
        console.error('WebDAV: Stringify notebook failed', words)
      }
      return Promise.reject('parse')
    }

    try {
      const response = await fetch(this.config.url + 'Saladict/notebook.json', {
        method: 'PUT',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${this.config.user}:${this.config.passwd}`)
        },
        body
      })
      if (!response.ok) {
        throw new Error()
      }
    } catch (e) {
      if (process.env.DEBUG) {
        console.error('WebDAV: upload failed', e)
      }
      return Promise.reject('network')
    }

    await this.setMeta({ timestamp, etag: '' })
  }

  delete({ force }) {
    // full sync anyway
    return this.add({ force })
  }

  async download({ testConfig, noCache }: DownloadConfig): Promise<void> {
    const config = testConfig || this.config

    if (!config.url) {
      if (process.env.DEBUG) {
        console.warn(`sync service ${Service.id} download: empty url`)
      }
      return
    }

    const headers: { [name: string]: string } = {
      Authorization: 'Basic ' + window.btoa(`${config.user}:${config.passwd}`)
    }
    if (!testConfig && !noCache && this.meta.etag != null) {
      headers['If-None-Match'] = this.meta.etag
      headers['If-Modified-Since'] = this.meta.etag
    }

    try {
      var response = await fetch(
        config.url +
          (config.url.endsWith('/') ? '' : '/') +
          'Saladict/notebook.json',
        {
          method: 'GET',
          headers
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
      if (process.env.DEBUG) {
        console.error('Fetch webdav notebook.json error', response)
      }
      return Promise.reject('parse')
    }

    if (process.env.DEBUG) {
      if (!response.headers.get('ETag')) {
        console.warn('webdav notebook.json no etag', response)
      }
    }

    if (!Array.isArray(json.words) || json.words.some(w => !w.date)) {
      if (process.env.DEBUG) {
        console.error('Parse webdav notebook.json error: incorrect words', json)
      }
      return Promise.reject('format')
    }

    if (!json.timestamp) {
      if (process.env.DEBUG) {
        console.error('webdav notebook.json no timestamp', json)
      }
      return Promise.reject('timestamp')
    }

    if (testConfig) {
      // connectivity is ok
      return
    }

    const oldMeta = this.meta

    if (!oldMeta.timestamp || json.timestamp >= oldMeta.timestamp) {
      await this.setMeta({
        timestamp: json.timestamp,
        etag: response.headers.get('ETag') || oldMeta.etag || ''
      })
    }

    if (!noCache && oldMeta.timestamp && json.timestamp <= oldMeta.timestamp) {
      // older file
      return
    }

    await setNotebook(json.words, true)

    if (process.env.DEBUG) {
      console.log('Webdav download', json)
    }
  }

  async destroy() {
    browser.alarms.onAlarm.removeListener(this.handleSyncAlarm)
    await browser.alarms.clear('webdav')
  }

  setMeta(meta: SyncMeta) {
    this.meta = meta
    return setMeta(Service.id, meta)
  }

  async getMeta() {
    const meta = await getMeta<SyncMeta>(Service.id)
    this.meta = meta || ({} as SyncMeta)
  }
}
