import { empty, merge } from 'rxjs'
import { share, buffer, debounceTime, filter } from 'rxjs/operators'
import { AppConfig } from '@/app-config'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'
import { whenKeyPressed, isQSKey } from './helper'

/**
 * Listen to triple-ctrl shortcut which opens quick search panel.
 * Pressing ctrl/command key more than three times within 500ms
 * trigers triple-ctrl.
 */
export function createQuickSearchStream(config: AppConfig | null) {
  if (!config || !config.tripleCtrl || isStandalonePage() || isOptionsPage()) {
    return empty()
  }

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
}
