import { AppConfig, getDefaultConfig } from '@/app-config'

import { Observable, fromEventPattern, of, concat } from 'rxjs'
import { map } from 'rxjs/operators'

const listeners = new Set<(changed: AppConfigChanged) => void>()

export interface AppConfigChanged {
  newConfig: AppConfig
  oldConfig?: AppConfig
}

export const initConfig = jest.fn(() => Promise.resolve())

export const resetConfig = jest.fn(() => Promise.resolve())

export const getConfig = jest.fn(() => Promise.resolve(getDefaultConfig()))

export const updateConfig = jest.fn((config: AppConfig) => Promise.resolve())

export const addConfigListener = jest.fn(
  (cb: (changed: AppConfigChanged) => void) => {
    listeners.add(cb)
  }
)

/**
 * Get AppConfig and create a stream listening config changing
 */
export const createConfigStream = jest.fn(
  (): Observable<AppConfig> => {
    return concat<AppConfig>(
      of(getDefaultConfig()),
      fromEventPattern<AppConfigChanged | [AppConfigChanged]>(handler =>
        addConfigListener(handler)
      ).pipe(map(args => (Array.isArray(args) ? args[0] : args).newConfig))
    )
  }
)

export function dispatchConfigChangedEvent(
  newConfig: AppConfig,
  oldConfig?: AppConfig
) {
  listeners.forEach(cb => cb({ newConfig, oldConfig }))
}
