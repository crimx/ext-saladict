import { AppConfig, appConfigFactory } from '@/app-config'
import { storage, StorageListenerCb, StorageUpdate } from './browser-api'
// import { Observable, from, concat } from 'rxjs'
// import { map, filter } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'
import { filter } from 'rxjs/operators/filter'

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
  return concat(
    from(getAppConfig()),
    storage.createStream<AppConfig>('config').pipe(
      filter((config): config is StorageUpdate<AppConfig> => Boolean(config.newValue)),
      map(config => config.newValue),
    ),
  )
}

export const appConfig = {
  get: getAppConfig,
  set: setAppConfig,
  addListener: addAppConfigListener,
  createStream: createAppConfigStream,
}
