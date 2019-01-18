/**
 * Abstruct layer for managing app config.
 * From v6.12.0, there is a set of different configs (called profiles) for user to choose.
 * This layer filters out the "profiles" so that in perspective of
 * the rest of the program, there is only one config, which is called
 * the "active config". This is for backward compatibility.
 */

import { appConfigFactory, AppConfig } from '@/app-config'
import { defaultProfilesFactory } from '@/app-config/default-profiles'
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

export function getProfileName (name: string, t: TranslationFunction): string {
  // default names
  const match = /^%%_(\S+)_%%$/.exec(name)
  if (match) {
    return t(`profile:${match[1]}`) || name
  }
  return name
}

export async function initConfig (): Promise<AppConfig> {
  const {
    configProfileIDs,
    activeConfigID,
  } = await storage.sync.get(['configProfileIDs', 'activeConfigID'])

  let modes: AppConfig[] = []
  if (configProfileIDs && configProfileIDs.length > 0) {
    // quota bytes limit
    for (let i = 0; i < configProfileIDs.length; i++) {
      const id = configProfileIDs[i]
      const config = (await storage.sync.get(id))[id]
      modes.push(config ? mergeConfig(config) : appConfigFactory(id))
    }
  } else {
    modes = defaultProfilesFactory()
    // old config, replace the default if exist
    const config = (await storage.sync.get('config')).config
    if (config) {
      modes[0] = mergeConfig(config)
      await storage.sync.remove('config')
    }
  }

  await storage.sync.set({
    configProfileIDs: modes.map(m => m.id),
    activeConfigID: activeConfigID || modes[0].id
  })

  // beware of quota bytes per item exceeds
  for (let i = 0; i < modes.length; i++) {
    await storage.sync.set({ [modes[i].id]: modes[i] })
  }

  return (activeConfigID && modes.find(m => m.id === activeConfigID)) || modes[0]
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
  return storage.sync.set({
    configProfileIDs: [...configProfileIDs, config.id],
    [config.id]: config,
  })
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
  return appConfigFactory()
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
        if (!configProfileIDs || -1 === configProfileIDs.indexOf(config.id)) {
          if (process.env.NODE_ENV === 'production') {
            console.error('Update Config Error: Not exist', config)
          }
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

/**
 * Listen storage changes of the current config
 */
export async function addActiveConfigListener (
  cb: (changes: AppConfigChanged) => any
) {
  let gActiveConfigID = (await storage.sync.get('activeConfigID')).activeConfigID

  storage.sync.addListener(async (changes, area) => {
    if (area !== 'sync') { return }

    if (changes.activeConfigID) {
      const { newValue: newID, oldValue: oldID } = changes.activeConfigID
      if (!newID) { return }
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
