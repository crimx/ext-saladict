import { Observable, empty, merge } from 'rxjs'
import { AppConfig } from '@/app-config'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'
import {
  distinctUntilChanged,
  switchMap,
  share,
  buffer,
  debounceTime,
  filter
} from 'rxjs/operators'
import { whenKeyPressed, isQSKey } from './helper'

/**
 * Listen to triple-ctrl shortcut which opens quick search panel.
 * Pressing ctrl/command key more than three times within 500ms
 * trigers triple-ctrl.
 */
export function createQuickSearchStream(config$: Observable<AppConfig>) {
  if (isStandalonePage() || isOptionsPage()) {
    return empty()
  }

  return config$.pipe(
    distinctUntilChanged(
      (oldConfig, newConfig) => oldConfig.tripleCtrl === newConfig.tripleCtrl
    ),
    switchMap(({ tripleCtrl }) => {
      if (!tripleCtrl) return empty()

      const qsKeyPressed$$ = share<true>()(whenKeyPressed(isQSKey))

      return qsKeyPressed$$.pipe(
        buffer(
          merge(
            debounceTime(500)(qsKeyPressed$$), // collect after 0.5s
            whenKeyPressed(e => !isQSKey(e)) // other key pressed
          )
        ),
        filter(group => group.length >= 3)
      )
    })
  )
}
