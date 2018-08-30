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

export interface AppConfigChanged {
  newConfig: AppConfig,
  oldConfig?: AppConfig,
}

export const addConfig = jest.fn(() => Promise.resolve())

export const removeConfig = jest.fn(() => Promise.resolve())

export const getActiveConfig = jest.fn(() => Promise.resolve(appConfigFactory('config')))

export const updateConfigIDList = jest.fn(() => Promise.resolve())

export const updateActiveConfigID = jest.fn(() => Promise.resolve())

export const updateActiveConfig = jest.fn((config: AppConfig) => Promise.resolve())

export const addActiveConfigListener = jest.fn((cb: StorageListenerCb) => {
  listeners.add(cb)
})

/**
 * Get AppConfig and create a stream listening config changing
 */
export const createActiveConfigStream = jest.fn((): Observable<AppConfig> => {
  return concat<AppConfig>(
    of(appConfigFactory('config')),
    fromEventPattern<AppConfigChanged | [AppConfigChanged]>(addActiveConfigListener).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newConfig)
    )
  )
})

export function dispatchActiveConfigChangedEvent (newConfig: AppConfig, oldConfig?: AppConfig) {
  listeners.forEach(cb => cb({ newConfig, oldConfig }))
}
