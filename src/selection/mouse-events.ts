import { isBlacklisted, config$$ } from './helper'

import { fromEvent } from 'rxjs/observable/fromEvent'
import { merge } from 'rxjs/observable/merge'
import { timer } from 'rxjs/observable/timer'
import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operators/map'
import { scan } from 'rxjs/operators/scan'
import { take } from 'rxjs/operators/take'
import { delay } from 'rxjs/operators/delay'
import { mapTo } from 'rxjs/operators/mapTo'
import { share } from 'rxjs/operators/share'
import { filter } from 'rxjs/operators/filter'
import { refCount } from 'rxjs/operators/refCount'
import { switchMap } from 'rxjs/operators/switchMap'
import { publishReplay } from 'rxjs/operators/publishReplay'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'

/**
 * Track the last mousedown target for identifying input field, if needed.
 */
export const lastMousedown$$ = merge(
  fromEvent<MouseEvent>(window, 'mousedown', { capture: true }),
  fromEvent<TouchEvent>(window, 'touchstart', { capture: true }),
  of(null),
).pipe(
  publishReplay<MouseEvent | TouchEvent | null>(1),
  refCount(),
)

/**
 * A valid mouseup:
 * 1. Not in Saladict iframe.
 * 2. Event target is not a Saladict exposed element.
 * 3. Site url is not blacked.
 */
export const validMouseup$$ = merge(
  fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).pipe(
    filter(e => e.button === 0)
  ),
  fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(
    map(e => e.changedTouches[0])
  ),
).pipe(
  withLatestFrom(config$$),
  filter(([{ target }, config]) => {
    if (window.name === 'saladict-wordeditor') {
      return false
    }

    if (target) {
      if (typeof target['className'] === 'string' &&
          (target['className'] as string).includes('saladict-')
      ) {
        return false
      }
    }

    if (isBlacklisted(config)) {
      return false
    }

    return true
  }),
  // if user click on a selected text,
  // getSelection would reture the text before the highlight disappears
  // delay to wait for selection get cleared
  delay(10),
  share(),
)

/**
 * Count mouse click within a period
 */
export const clickPeriodCount$ = merge(
  mapTo(true)(validMouseup$$),
  validMouseup$$.pipe(
    withLatestFrom(config$$),
    switchMap(args => timer(args[1].doubleClickDelay).pipe(
      take(1),
      mapTo(false)
    )),
  ),
).pipe(
  scan((sum: number, flag: boolean) => flag ? sum + 1 : 0, 0)
)
