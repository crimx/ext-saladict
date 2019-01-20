import { getDefaultConfig, AppConfig } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'
import { storage } from './browser-api'

import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'

export interface StorageChanged<T> {
  newValue: T,
  oldValue?: T,
}

export interface AppConfigChanged {
  newConfig: AppConfig,
  oldConfig?: AppConfig,
}

export async function initConfig (): Promise<AppConfig> {
  let { baseconfig } = await storage.sync.get<{
    baseconfig: AppConfig
  }>('baseconfig')

  if (!baseconfig || !baseconfig.version) {
    // legacy configs
    const { activeConfigID } = await storage.sync.get('activeConfigID')
    if (activeConfigID) {
      baseconfig = (await storage.sync.get(activeConfigID))[activeConfigID]
    }
  }

  if (!baseconfig || !baseconfig.version) {
    // old config, replace the default if exist
    const { config: oldConfig } = (await storage.sync.get('config'))
    if (oldConfig) {
      baseconfig = mergeConfig(oldConfig)
      await storage.sync.remove('config')
    }
  }

  baseconfig = baseconfig && baseconfig.version
    ? mergeConfig(baseconfig)
    : getDefaultConfig()

  await updateConfig(baseconfig)
  return baseconfig
}

export async function resetConfig () {
  const baseconfig = getDefaultConfig()
  await updateConfig(baseconfig)
  return baseconfig
}

export async function getConfig (): Promise<AppConfig> {
  const { baseconfig } = await storage.sync.get<{
    baseconfig: AppConfig
  }>('baseconfig')
  return baseconfig || getDefaultConfig()
}

export function updateConfig (baseconfig: AppConfig): Promise<void> {
  return storage.sync.set({ baseconfig })
}

/**
 * Listen to config changes
 */
export async function addConfigListener (
  cb: (changes: AppConfigChanged) => any
) {
  storage.sync.addListener(changes => {
    if (changes.baseconfig) {
      const {
        newValue,
        oldValue,
      } = (changes as { baseconfig: StorageChanged<AppConfig> }).baseconfig
      if (newValue) {
        cb({ newConfig: newValue, oldConfig: oldValue })
      }
    }
  })
}

/**
 * Get config and create a stream listening to config change
 */
export function createConfigStream (): Observable<AppConfig> {
  return concat(
    from(getConfig()),
    fromEventPattern<[AppConfigChanged] | AppConfigChanged>(addConfigListener as any).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newConfig),
    ),
  )
}
