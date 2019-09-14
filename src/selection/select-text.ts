import { empty, fromEvent, merge, timer } from 'rxjs'
import {
  withLatestFrom,
  filter,
  map,
  mapTo,
  debounce,
  switchMap,
  scan,
  startWith
} from 'rxjs/operators'
import { AppConfig } from '@/app-config'
import {
  isInDictPanel,
  isStandalonePage,
  isInSaladictExternal
} from '@/_helpers/saladict'
import {
  getTextFromSelection,
  getSentenceFromSelection
} from 'get-selection-more'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { newWord } from '@/_helpers/record-manager'
import { isTypeField } from './helper'

export function createSelectTextStream(config: AppConfig | null) {
  if (!config || isStandalonePage()) {
    return empty()
  }

  const mousedown$ = merge(
    fromEvent<MouseEvent>(window, 'mousedown', { capture: true }),
    fromEvent<TouchEvent>(window, 'touchstart', { capture: true }).pipe(
      map(e => e.changedTouches[0])
    )
  )

  const mouseup$ = merge(
    fromEvent<MouseEvent>(window, 'mouseup', { capture: true }),
    fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(
      map(e => e.changedTouches[0])
    )
  )

  const clickPeriodCount$ = mouseup$.pipe(
    switchMap(() =>
      timer(config.doubleClickDelay).pipe(
        mapTo(false),
        startWith(true)
      )
    ),
    scan((sum: number, flag: boolean) => (flag ? sum + 1 : 0), 0)
  )

  const isMouseDown$ = merge(mapTo(true)(mousedown$), mapTo(false)(mouseup$))

  return fromEvent(document, 'selectionchange').pipe(
    withLatestFrom(isMouseDown$),
    debounce(([, isWithMouse]) => (isWithMouse ? mouseup$ : timer(400))),
    map(([, isWithMouse]) => [window.getSelection(), isWithMouse] as const),
    filter(
      (args): args is [Selection, boolean] =>
        !!args[0] && !isInSaladictExternal(args[0].anchorNode)
    ),
    withLatestFrom(mouseup$, clickPeriodCount$),
    map(([[selection, isWithMouse], mouseup, clickPeriodCount]) => {
      const self = isInDictPanel(selection.anchorNode || mouseup.target)

      if (config.noTypeField && isTypeField(selection.anchorNode)) {
        return self
      }

      const text = getTextFromSelection(selection)

      if (!checkSupportedLangs(config.language, text)) {
        return self
      }

      if (isWithMouse) {
        return {
          word: newWord({ text, context: getSentenceFromSelection(selection) }),
          self,
          dbClick: clickPeriodCount >= 2,
          mouseX: mouseup.clientX,
          mouseY: mouseup.clientY,
          shiftKey: !!mouseup['shiftKey'],
          ctrlKey: !!mouseup['ctrlKey'],
          metaKey: !!mouseup['metaKey']
        }
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect()

      return {
        word: newWord({ text, context: getSentenceFromSelection(selection) }),
        self,
        dbClick: clickPeriodCount >= 2,
        mouseX: rect.right,
        mouseY: rect.top
      }
    })
  )
}
