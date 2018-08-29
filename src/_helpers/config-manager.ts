/**
 * Abstruct layer for managing app config.
 * From v6.12.0, there is a set of different configs (called modes) for user to choose.
 * This layer filters out the "modes" so that in perspective of
 * the rest of the program, there is only one config, which is called
 * the "active config". This is for backward compatibility.
 */

import { AppConfig, appConfigFactory } from '@/app-config'
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

export type AppConfigChanged = {
  config: {
    newValue: AppConfig,
    oldValue?: AppConfig,
  }
}

export async function initConfig (): Promise<AppConfig> {
  const obj = await storage.sync.get(null)
  let modes: AppConfig[]
  if (obj.configModeIDs && obj.configModeIDs.length > 0) {
    modes = obj.configModeIDs
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
      configModeIDs: modes.map(m => m.id),
      activeConfigID: obj.activeConfigID || modes[0].id
    }
  ))
  return (obj.activeConfigID && modes.find(m => m.id === obj.activeConfigID)) || modes[0]
}

export async function resetConfig () {
  const ids = (await storage.sync.get('configModeIDs')).configModeIDs || []
  await storage.sync.remove(['configModeIDs', 'activeConfigID', ...ids])
  return initConfig()
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

export function updateConfigModeIDList (list: string[]): Promise<void> {
  return storage.sync.set({ configModeIDs: list })
}

export function updateActiveConfigID (id: string): Promise<void> {
  if (process.env.DEV_BUILD) {
    storage.sync.get('configModeIDs')
      .then(({ configModeIDs }) => {
        if (-1 === configModeIDs.indexOf(id)) {
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
    storage.sync.get('configModeIDs')
      .then(({ configModeIDs }) => {
        if (-1 === configModeIDs.indexOf(config.id)) {
          console.error('Update Config Error: Not exist', config)
        }
      })
  }
  return storage.sync.set({ [config.id]: config })
}

/** Keep tracking the active config id for easy usage */
let gActiveConfigID: string

/**
 * Listen storage changes of the current config
 */
export async function addActiveConfigListener (
  cb: (newValue: AppConfig, oldValue?: AppConfig) => any
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
          cb(obj[newID], obj[oldID])
        }
      } else {
        const newConfig = (await storage.sync.get(newID))[newID]
        if (newConfig) {
          cb(newConfig)
        }
      }
      return
    }

    if (changes[gActiveConfigID] && changes[gActiveConfigID].newValue) {
      cb(changes[gActiveConfigID].newValue)
    }
  })
}

/**
 * Get active config and create a stream listening to config changing
 */
export function createActiveConfigStream (): Observable<AppConfig> {
  return concat(
    from(getActiveConfig()),
    fromEventPattern(addActiveConfigListener as any).pipe(
      map(args => Array.isArray(args) ? args[0] : args),
    ),
  )
}
