import { AppConfig, appConfigFactory } from '@/app-config'
import { storage, StorageListenerCb, StorageUpdate } from './browser-api'
import { map, filter } from 'rxjs/operators'
import { Observable } from 'rxjs'

export type AppConfigChanged = {
  config: {
    newValue: AppConfig,
    oldValue?: AppConfig,
  }
}

export function getAppConfig (): Promise<AppConfig> {
  return storage.sync.get<{ config?: AppConfig }>('config')
    .then(({ config }) => {
      if (config && typeof config.version) {
        return config
      }
      return appConfigFactory()
    })
}

export function setAppConfig (config: AppConfig): Promise<void> {
  return storage.sync.set({ config })
}

export function addAppConfigListener (cb: StorageListenerCb): void {
  return storage.sync.addListener('config', cb)
}

/**
 * Get AppConfig and create a stream listening config changing
 */
export function createAppConfigStream (): Observable<AppConfig> {
  return storage.createStream<AppConfig>('config').pipe(
    filter((config): config is StorageUpdate<AppConfig> => Boolean(config.newValue)),
    map(config => config.newValue),
  )
}

export const appConfig = {
  get: getAppConfig,
  set: setAppConfig,
  addListener: addAppConfigListener,
  createStream: createAppConfigStream,
}
