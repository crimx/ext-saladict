import { storage } from '@/_helpers/browser-api'
import { Word } from '@/_helpers/record-manager'
import {
  getWords,
  saveWords,
  getSyncMeta,
  setSyncMeta,
  deleteSyncMeta
} from '@/background/database'
import { I18nManager } from '../i18n-manager'

export interface StorageSyncConfig {
  syncConfig: { [id: string]: any }
}

export async function setSyncConfig<T = any>(
  serviceID: string,
  config: T
): Promise<void> {
  let { syncConfig } = await storage.sync.get<StorageSyncConfig>('syncConfig')
  if (!syncConfig) {
    syncConfig = {}
  }
  syncConfig[serviceID] = config
  await storage.sync.set({ syncConfig })
}

export async function getSyncConfig<T>(
  serviceID: string
): Promise<T | undefined> {
  const { syncConfig } = await storage.sync.get<StorageSyncConfig>('syncConfig')
  if (syncConfig !== undefined) {
    return syncConfig[serviceID]
  }
}

export async function removeSyncConfig(serviceID?: string): Promise<void> {
  if (serviceID) {
    await setSyncConfig(serviceID, null)
  } else {
    await storage.sync.remove('syncConfig')
  }
}

/**
 * Service meta data is saved with the database
 * so that it can be shared across browser vendors.
 */
export async function setMeta<T = any>(
  serviceID: string,
  meta: T
): Promise<void> {
  await setSyncMeta(serviceID, JSON.stringify(meta))
}

/**
 * Service meta data is saved with the database
 * so that it can be shared across browser vendors.
 */
export async function getMeta<T>(serviceID: string): Promise<T | undefined> {
  const text = await getSyncMeta(serviceID)
  if (text) {
    return JSON.parse(text)
  }
}

/**
 * Service meta data is saved with the database
 * so that it can be shared across browser vendors.
 */
export async function deleteMeta(serviceID: string): Promise<void> {
  await deleteSyncMeta(serviceID)
}

export async function setNotebook(
  words: Word[],
  fromSync?: boolean
): Promise<void> {
  await saveWords({ area: 'notebook', words, fromSync })
}

export async function getNotebook(): Promise<Word[]> {
  return (await getWords({ area: 'notebook' })).words || []
}

export async function notifyError(
  id: string,
  error: Error | string,
  msgPrefix = '',
  msgPostfix = ''
): Promise<void> {
  const { i18n } = await I18nManager.getInstance()
  await i18n.loadNamespaces('sync')
  const msgPath = `sync:${id}.error.${error}`
  const msg = i18n.exists(msgPath) ? i18n.t(msgPath) : `Unknown error: ${error}`

  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
    title: `Saladict ${i18n.t(`sync:${id}.title`)}`,
    message: msgPrefix + msg + msgPostfix,
    eventTime: Date.now() + 20000,
    priority: 2
  })
}
