import { filter, map, switchMap, delay } from 'rxjs/operators'
import { of, Observable } from 'rxjs'
import { MouseEvent } from 'react'

/**
 * Resuable Observable logics
 */

/**
 * Emits true on mouse enter and false on mouse leave.
 * Delay on mouse enter.
 *
 * Shadow DOM does not send mouseenter and mouseleave
 * cross the boundary which means React synthetic
 * event handler will not collect.
 * Here mouseover and mouseout are used to simulate.
 *
 * @param event$ mouseover and mouseout events
 */
export function hover<N extends Node>(
  event$: Observable<MouseEvent<N>>
): Observable<boolean> {
  return event$.pipe(
    filter(
      e =>
        e.relatedTarget !== e.currentTarget &&
        (!(e.relatedTarget instanceof Node) ||
          !e.currentTarget.contains(e.relatedTarget))
    ),
    map(e => e.type === 'mouseover'),
    // delay enter but not leave
    switchMap(isEnter => of(isEnter).pipe(delay(isEnter ? 500 : 0)))
  )
}
