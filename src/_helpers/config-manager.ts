/**
 * Abstruct layer for managing app config.
 * From v6.12.0, there is a set of different configs (called profiles) for user to choose.
 * This layer filters out the "profiles" so that in perspective of
 * the rest of the program, there is only one config, which is called
 * the "active config". This is for backward compatibility.
 */

import { AppConfig } from '@/app-config'
import { defaultModesFactory } from '@/app-config/default-modes'
import { storage } from './browser-api'
// import { Observable, from, concat } from 'rxjs'
// import { map, filter } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'
import { mergeConfig } from '@/app-config/merge-config'

export interface StorageChanged<T> {
  newValue: T,
  oldValue?: T,
}

export interface AppConfigChanged {
  newConfig: AppConfig,
  oldConfig?: AppConfig,
}

export async function initConfig (): Promise<AppConfig> {
  const obj = await storage.sync.get(null)
  let modes: AppConfig[]
  if (obj.configProfileIDs && obj.configProfileIDs.length > 0) {
    modes = obj.configProfileIDs
      .filter(id => obj[id])
      .map(id => mergeConfig(obj[id]))
  } else {
    modes = defaultModesFactory()
    // old config, replace the default if exist
    if (obj.config) {
      modes[0] = mergeConfig(obj.config)
      await storage.sync.remove('config')
    }
  }
  await storage.sync.set(modes.reduce(
    (data, m) => ((data[m.id] = m), data),
    {
      configProfileIDs: modes.map(m => m.id),
      activeConfigID: obj.activeConfigID || modes[0].id
    }
  ))
  return (obj.activeConfigID && modes.find(m => m.id === obj.activeConfigID)) || modes[0]
}

export async function resetConfig () {
  const ids = (await storage.sync.get('configProfileIDs')).configProfileIDs || []
  await storage.sync.remove(['configProfileIDs', 'activeConfigID', ...ids])
  return initConfig()
}

export async function addConfig (config: AppConfig): Promise<void> {
  const { configProfileIDs } = await storage.sync.get<{ configProfileIDs: string[] }>('configProfileIDs')
  if (process.env.DEV_BUILD) {
    if (configProfileIDs.includes(config.id) ||
       (await storage.sync.get(config.id))[config.id]
    ) {
      console.warn('add config: config already exists')
    }
  }
  configProfileIDs.push(config.id)
  return storage.sync.set({ configProfileIDs, [config.id]: config })
}

export async function removeConfig (id: string): Promise<void> {
  const { configProfileIDs } = await storage.sync.get<{ configProfileIDs: string[] }>('configProfileIDs')
  if (process.env.DEV_BUILD) {
    if (!configProfileIDs.includes(id) ||
       !(await storage.sync.get(id))[id]
    ) {
      console.warn('remove config: config not exists')
    }
  }
  await storage.sync.set({ configProfileIDs: configProfileIDs.filter(x => x !== id) })
  return storage.sync.remove(id)
}

/**
 * Get the config under the current mode
 */
export async function getActiveConfig (): Promise<AppConfig> {
  const { activeConfigID } = await storage.sync.get('activeConfigID')
  if (activeConfigID) {
    const config = (await storage.sync.get(activeConfigID))[activeConfigID]
    if (config) {
      return config
    }
  }
  return initConfig()
}

/**
 * This is mainly for ordering
 */
export async function getConfigIDList (): Promise<string[]> {
  return (await storage.sync.get('configProfileIDs')).configProfileIDs || []
}

/**
 * This is mainly for ordering
 */
export function updateConfigIDList (list: string[]): Promise<void> {
  return storage.sync.set({ configProfileIDs: list })
}

/**
 * Change the current active config
 */
export async function getActiveConfigID (): Promise<string> {
  return (await storage.sync.get('activeConfigID')).activeConfigID
}

/**
 * Change the current active config
 */
export function updateActiveConfigID (id: string): Promise<void> {
  if (process.env.DEV_BUILD) {
    storage.sync.get('configProfileIDs')
      .then(({ configProfileIDs }) => {
        if (-1 === configProfileIDs.indexOf(id)) {
          console.error('Update Active Config ID Error: Not exist', id)
        }
      })
  }
  return storage.sync.set({ activeConfigID: id })
}

/**
 * Update the config under the current mode
 */
export function updateActiveConfig (config: AppConfig): Promise<void> {
  if (process.env.DEV_BUILD) {
    storage.sync.get('configProfileIDs')
      .then(({ configProfileIDs }) => {
        if (-1 === configProfileIDs.indexOf(config.id)) {
          console.error('Update Config Error: Not exist', config)
        }
      })
  }
  return storage.sync.set({ [config.id]: config })
}

export function addConfigIDListListener (
  cb: (changes: StorageChanged<string[]>) => any
) {
  storage.sync.addListener('configProfileIDs', ({ configProfileIDs }) => {
    if (configProfileIDs.newValue) {
      cb(configProfileIDs as any)
    }
  })
}

/** Keep tracking the active config id for easy usage */
let gActiveConfigID: string

/**
 * Listen storage changes of the current config
 */
export async function addActiveConfigListener (
  cb: (changes: AppConfigChanged) => any
) {
  if (!gActiveConfigID) {
    gActiveConfigID = (await storage.sync.get('activeConfigID')).activeConfigID
  }
  storage.sync.addListener(async (changes, area) => {
    if (area !== 'sync') { return }

    if (changes.activeConfigID) {
      const { newValue: newID, oldValue: oldID } = changes.activeConfigID
      gActiveConfigID = newID
      if (oldID) {
        const obj = await storage.sync.get([oldID, newID])
        if (obj[newID]) {
          cb({ newConfig: obj[newID], oldConfig: obj[oldID] })
        }
      } else {
        const newConfig = (await storage.sync.get(newID))[newID]
        if (newConfig) {
          cb({ newConfig })
        }
      }
      return
    }

    if (changes[gActiveConfigID]) {
      const { newValue, oldValue } = changes[gActiveConfigID]
      if (newValue) {
        cb({ newConfig: newValue, oldConfig: oldValue })
      }
    }
  })
}

/**
 * Get active config and create a stream listening to config changing
 */
export function createConfigIDListStream (): Observable<string[]> {
  return concat(
    from(getConfigIDList()),
    fromEventPattern<[StorageChanged<string[]>] | StorageChanged<string[]>>(
      addConfigIDListListener as any
    ).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newValue),
    ),
  )
}

/**
 * Get active config and create a stream listening to config changing
 */
export function createActiveConfigStream (): Observable<AppConfig> {
  return concat(
    from(getActiveConfig()),
    fromEventPattern<[AppConfigChanged] | AppConfigChanged>(addActiveConfigListener as any).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newConfig),
    ),
  )
}
