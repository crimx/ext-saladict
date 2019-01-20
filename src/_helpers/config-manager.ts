import { getDefaultConfig, AppConfig } from '@/app-config'
import { storage } from './browser-api'

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
  let { config } = await storage.sync.get('app-config')

  if (!config || !config.version) {
    // legacy configs
    const { activeConfigID } = await storage.sync.get('activeConfigID')
    if (activeConfigID) {
      config = (await storage.sync.get(activeConfigID))[activeConfigID]
    }
  }

  config = config && config.version
    ? mergeConfig(config)
    : getDefaultConfig()

  await updateConfig(config)
  return config
}

export async function resetConfig () {
  const config = getDefaultConfig()
  await updateConfig(config)
  return config
}

export async function getConfig (): Promise<AppConfig> {
  return (await storage.sync.get('app-config')).config || getDefaultConfig()
}

export function updateConfig (config: AppConfig): Promise<void> {
  return storage.sync.set({ 'app-config': config })
}

/**
 * Listen to config changes
 */
export async function addConfigListener (
  cb: (changes: AppConfigChanged) => any
) {
  storage.sync.addListener((changes, area) => {
    if (area === 'sync' && changes.config) {
      const { newValue, oldValue } = changes.config
      cb({ newConfig: newValue, oldConfig: oldValue })
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
