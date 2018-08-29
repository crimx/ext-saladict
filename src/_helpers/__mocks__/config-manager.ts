import { AppConfig, appConfigFactory } from '@/app-config'
import { StorageListenerCb, StorageChange } from '@/_helpers/browser-api'
// import { map } from 'rxjs/operators'
// import { Observable, fromEventPattern, of, concat } from 'rxjs'
import { Observable } from 'rxjs/Observable'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'
import { of } from 'rxjs/observable/of'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'

const listeners = new Set()

export type AppConfigChanged = {
  config: StorageChange<AppConfig>
}

export const getActiveConfig = jest.fn(() => Promise.resolve(appConfigFactory()))

export const updateActiveConfig = jest.fn((config: AppConfig) => Promise.resolve())

export const addAppConfigListener = jest.fn((cb: StorageListenerCb) => {
  listeners.add(cb)
})

export const removeAppConfigListener = jest.fn((cb: StorageListenerCb) => {
  listeners.delete(cb)
})

/**
 * Get AppConfig and create a stream listening config changing
 */
export const createActiveConfigStream = jest.fn((): Observable<AppConfig> => {
  return concat<AppConfig>(
    of(appConfigFactory()),
    fromEventPattern<AppConfigChanged>(
      handler => addAppConfigListener(handler),
      handler => removeAppConfigListener(handler),
    ).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).config.newValue)
    )
  )
})

export function dispatchAppConfigEvent (newValue?: AppConfig, oldValue?: AppConfig) {
  listeners.forEach(cb => cb({ config: { newValue: newValue, oldValue: oldValue } }, 'sync'))
}

export const appConfig = {
  get: getActiveConfig,
  set: updateActiveConfig,
  addListener: addAppConfigListener,
  createStream: createActiveConfigStream,
}
