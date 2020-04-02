import { storage } from '@/_helpers/browser-api'
import { Word } from '@/_helpers/record-manager'
import {
  getWords,
  saveWords,
  getSyncMeta,
  setSyncMeta,
  deleteSyncMeta
} from '@/background/database'

import { Observable, concat, from } from 'rxjs'
import { map, filter, distinctUntilChanged } from 'rxjs/operators'

interface StorageSyncConfig {
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

/** Get a sync config and listen changes */
export function createSyncConfigStream<C>(
  serviceID: string
): Observable<C | null> {
  return concat(
    from(getSyncConfig<C | null>(serviceID)),
    storage.sync
      .createStream<{ [index: string]: C | null }>('syncConfig')
      .pipe(map(({ newValue }) => newValue && newValue[serviceID]))
  ).pipe(
    filter((v): v is C | null => v !== undefined),
    distinctUntilChanged(
      (x, y) =>
        x === y ||
        (x != null && y != null && Object.keys(y).every(k => y[k] === x[k]))
    )
  )
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
