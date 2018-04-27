import { AppConfig, appConfigFactory } from '@/app-config'
import { StorageListenerCb, StorageChange } from '@/_helpers/browser-api'
import { map, filter, tap } from 'rxjs/operators'
import { Observable, fromEventPattern, of, concat } from 'rxjs'
const listeners = new Set()

export type AppConfigChanged = {
  config: StorageChange<AppConfig>
}

export const getAppConfig = jest.fn(() => Promise.resolve(appConfigFactory()))

export const setAppConfig = jest.fn((config: AppConfig) => Promise.resolve())

export const addAppConfigListener = jest.fn((cb: StorageListenerCb) => {
  listeners.add(cb)
})

export const removeAppConfigListener = jest.fn((cb: StorageListenerCb) => {
  listeners.delete(cb)
})

/**
 * Get AppConfig and create a stream listening config changing
 */
export const createAppConfigStream = jest.fn((): Observable<AppConfig> => {
  return concat<AppConfig>(
    of(appConfigFactory()),
    fromEventPattern<AppConfigChanged>(
      handler => addAppConfigListener(handler),
      handler => removeAppConfigListener(handler),
    ).pipe(
      map(args => args[0].config.newValue)
    )
  )
})

export function dispatchAppConfigEvent (newValue?: AppConfig, oldValue?: AppConfig) {
  listeners.forEach(cb => cb({ config: { newValue: newValue, oldValue: oldValue } }, 'sync'))
}

export const appConfig = {
  get: getAppConfig,
  set: setAppConfig,
  addListener: addAppConfigListener,
  createStream: createAppConfigStream,
}
