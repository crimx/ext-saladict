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
  replaceNotebook,
  setMeta,
  getMeta,
  notifyError
} from '../../helpers'

import { Mutable } from '@/typings/helpers'
import { storage } from '@/_helpers/browser-api'
import { createBasicAuthorizationHeader } from '@/_helpers/basic-auth'

export interface SyncConfig extends SyncServiceConfigBase {
  /** Server address. Ends with '/'. */
  readonly url: string
  readonly user: string
  readonly passwd: string
  /** In min */
  readonly duration: number
  /**
   * Mirror (full sync) mode. When enabled and a newer remote notebook is
   * downloaded, local words absent from the remote are deleted so that the
   * local notebook matches the remote exactly. Disabled by default to keep
   * the merge-only behavior and avoid data loss.
   */
  readonly fullSync?: boolean
}

export interface SyncMeta {
  readonly etag?: string
  readonly timestamp?: number
}

/** Normalize a WebDAV URL so that trailing slashes do not affect identity. */
export function normalizeWebdavUrl(url: string): string {
  return (url || '').trim().replace(/\/+$/, '')
}

/**
 * A sync target is identified by its normalized URL plus user. Changing only
 * duration, password, enable or fullSync keeps the same target, while a new
 * or changed URL/user is treated as a brand new target.
 */
export function getWebdavTargetId(
  config: Pick<SyncConfig, 'url' | 'user'>
): string {
  return `${normalizeWebdavUrl(config.url)}\u0000${config.user || ''}`
}

export interface WebdavSaveDecision {
  /** Whether the sync target (normalized URL + user) is new or changed. */
  readonly isNewTarget: boolean
  /** Whether a persisted timestamp baseline exists. */
  readonly hasBaseline: boolean
  /** Whether saving fullSync needs an explicit confirmation first. */
  readonly needsFullSyncConfirm: boolean
}

/**
 * Decide how to handle sync meta when saving a config: `isNewTarget` tells
 * whether persisted meta belongs to a different target and must be reset,
 * while `needsFullSyncConfirm` tells whether enabling fullSync requires an
 * explicit confirmation because the next sync may replace or delete local
 * words.
 */
export function getWebdavSaveDecision(args: {
  next: Pick<SyncConfig, 'url' | 'user' | 'fullSync'>
  prev?: Pick<SyncConfig, 'url' | 'user'>
  meta?: SyncMeta
}): WebdavSaveDecision {
  const isNewTarget =
    !args.prev || getWebdavTargetId(args.next) !== getWebdavTargetId(args.prev)
  const hasBaseline = !!args.meta?.timestamp
  const needsFullSyncConfirm =
    !!args.next.fullSync && (isNewTarget || !hasBaseline)
  return { isNewTarget, hasBaseline, needsFullSyncConfirm }
}

export class Service extends SyncService<SyncConfig, SyncMeta> {
  static readonly id = 'webdav'

  static getDefaultConfig(): SyncConfig {
    return {
      enable: false,
      url: '',
      user: '',
      passwd: '',
      duration: 15,
      fullSync: false
    }
  }

  meta: SyncMeta = {}

  private getAuthorizationHeader(config: Pick<SyncConfig, 'user' | 'passwd'>) {
    return createBasicAuthorizationHeader(config.user, config.passwd)
  }

  async onStart() {
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

  async checkDir(): Promise<boolean> {
    let text = ''
    try {
      const response = await fetch(this.config.url, {
        method: 'PROPFIND',
        headers: {
          Authorization: this.getAuthorizationHeader(this.config),
          'Content-Type': 'application/xml; charset="utf-8"',
          Depth: '1'
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('unauthorized')
        }
        throw new Error(`Network error: ${response.status}`)
      }
      text = await response.text()
    } catch (e) {
      throw new Error('network')
    }

    let doc: Document | undefined
    try {
      if (text) {
        doc = new DOMParser().parseFromString(text, 'text/xml')
      }
    } catch (e) {
      throw new Error('parse')
    }

    if (!doc) {
      throw new Error('parse')
    }

    const $responses = Array.from(doc.querySelectorAll('response'))
    for (const i in $responses) {
      const href = $responses[i].querySelector('href')
      if (href && href.textContent && href.textContent.endsWith('/Saladict/')) {
        // is Saladict
        if ($responses[i].querySelector('resourcetype collection')) {
          // is collection
          return true
        } else {
          throw new Error('dir')
        }
      }
    }

    return false
  }

  /**
   * Check server and create a Saladict Directory if not exist.
   */
  async init() {
    const dir = await this.checkDir()

    if (!dir) {
      // create directory
      const response = await fetch(this.config.url + 'Saladict', {
        method: 'MKCOL',
        headers: {
          Authorization: this.getAuthorizationHeader(this.config)
        }
      })
      if (!response.ok) {
        // cannot create directory
        throw new Error('mkcol')
      }
    }

    if (dir) {
      try {
        await this.download({ testConfig: this.config, noCache: true })
      } catch (e) {
        // Download failed, which is desired.
        return
      }
      // An old file exists on server.
      // Let user decide whether to upload.
      throw new Error('exist')
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
      throw new Error('parse')
    }

    try {
      const response = await fetch(this.config.url + 'Saladict/notebook.json', {
        method: 'PUT',
        headers: {
          Authorization: this.getAuthorizationHeader(this.config)
        },
        body
      })
      if (!response.ok) {
        throw new Error('network')
      }
    } catch (e) {
      if (process.env.DEBUG) {
        console.error('WebDAV: upload failed', e)
      }
      throw new Error('network')
    }

    await this.setMeta({ timestamp, etag: '' })
  }

  delete({ force }) {
    // full sync anyway
    return this.add({ force })
  }

  async download({
    testConfig,
    noCache
  }: DownloadConfig<SyncConfig>): Promise<void> {
    const config = testConfig || this.config

    if (!config.url) {
      if (process.env.DEBUG) {
        console.warn(`sync service ${Service.id} download: empty url`)
      }
      return
    }

    const headers: { [name: string]: string } = {
      Authorization: this.getAuthorizationHeader(config)
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
      if (process.env.DEBUG) {
        console.error(e)
      }
      throw new Error('network')
    }

    try {
      var json: NotebookFile = await response.json()
    } catch (e) {
      if (process.env.DEBUG) {
        console.error('Fetch webdav notebook.json error', response)
      }
      throw new Error('parse')
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
      throw new Error('format')
    }

    if (!json.timestamp) {
      if (process.env.DEBUG) {
        console.error('webdav notebook.json no timestamp', json)
      }
      throw new Error('timestamp')
    }

    if (testConfig) {
      // connectivity is ok
      return
    }

    const oldMeta = this.meta
    const nextMeta = {
      timestamp: json.timestamp,
      etag: response.headers.get('ETag') || oldMeta.etag || ''
    }

    if (!noCache && oldMeta.timestamp && json.timestamp <= oldMeta.timestamp) {
      // older file
      if (json.timestamp === oldMeta.timestamp) {
        await this.setMeta(nextMeta)
      }
      return
    }

    if (config.fullSync) {
      await replaceNotebook(json.words)
    } else {
      await setNotebook(json.words)
    }

    if (!oldMeta.timestamp || json.timestamp >= oldMeta.timestamp) {
      await this.setMeta(nextMeta)
    }

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
