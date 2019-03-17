import pako from 'pako'
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

/** Compressed config data */
interface AppConfigCompressed {
  /** version */
  v: 1
  /** data */
  d: string
}

function deflate (config: AppConfig): AppConfigCompressed {
  return {
    v: 1,
    d: pako.deflate(JSON.stringify(config), { to: 'string' })
  }
}

function inflate (config: AppConfig | AppConfigCompressed): AppConfig
function inflate (config: undefined): undefined
function inflate (config?: AppConfig | AppConfigCompressed): AppConfig | undefined
function inflate (config?: AppConfig | AppConfigCompressed): AppConfig | undefined {
  if (config && config['v'] === 1) {
    return JSON.parse(pako.inflate((config as AppConfigCompressed).d, { to: 'string' }))
  }
  return config as AppConfig
}

export async function initConfig (): Promise<AppConfig> {
  let baseconfig = await getConfig()

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
  return inflate(baseconfig || getDefaultConfig())
}

export function updateConfig (baseconfig: AppConfig): Promise<void> {
  return storage.sync.set({ baseconfig: deflate(baseconfig) })
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
      } = (changes as { baseconfig: StorageChanged<AppConfigCompressed> }).baseconfig
      if (newValue) {
        cb({ newConfig: inflate(newValue), oldConfig: inflate(oldValue) })
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
