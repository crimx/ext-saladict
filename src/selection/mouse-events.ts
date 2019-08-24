import { AppConfig } from '@/app-config'
import { isInSaladict } from '@/_helpers/saladict'

import { fromEvent, merge, timer, of, Observable } from 'rxjs'
import {
  map,
  scan,
  delay,
  mapTo,
  share,
  filter,
  refCount,
  switchMap,
  publishReplay,
  withLatestFrom
} from 'rxjs/operators'

import { isBlacklisted } from './helper'

/**
 * Track the last mousedown target for identifying input field, if needed.
 */
export function getMousedown$$() {
  return merge(
    fromEvent<MouseEvent>(window, 'mousedown', { capture: true }),
    fromEvent<TouchEvent>(window, 'touchstart', { capture: true }),
    of(null)
  ).pipe(
    // returns the last mousedown immediately when subscribe
    publishReplay(1),
    refCount()
  )
}

/**
 * A valid mouseup:
 * 1. Not in Saladict panel.
 * 2. Event target is not a Saladict exposed element.
 * 3. Site url is not blacked.
 */
export function getValidMouseup$$(config$: Observable<AppConfig>) {
  return merge(
    fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).pipe(
      filter(e => e.button === 0)
    ),
    fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(
      map(e => e.changedTouches[0])
    )
  ).pipe(
    withLatestFrom(config$),
    filter(([event, config]) => {
      if (isInSaladict(event.target)) {
        return false
      }
      if (isBlacklisted(config)) {
        return false
      }
      return true
    }),
    // if user click on a selected text,
    // getSelection would return the text before the highlight disappears
    // delay to wait for selection get cleared
    delay(10),
    share()
  )
}

/**
 * Count mouse click within a period
 */
export function getClickPeriodCount$(
  validMouseup$: Observable<[MouseEvent | TouchEvent, AppConfig]>
) {
  return merge(
    mapTo(true)(validMouseup$),
    validMouseup$.pipe(
      switchMap(([, config]) => mapTo(false)(timer(config.doubleClickDelay)))
    )
  ).pipe(scan((sum: number, flag: boolean) => (flag ? sum + 1 : 0), 0))
}
