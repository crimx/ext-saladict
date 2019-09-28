import { empty, fromEvent, merge, timer } from 'rxjs'
import {
  withLatestFrom,
  filter,
  map,
  mapTo,
  debounce,
  switchMap,
  scan,
  startWith,
  throttle
} from 'rxjs/operators'
import { AppConfig } from '@/app-config'
import { isInDictPanel, isInSaladictExternal } from '@/_helpers/saladict'
import {
  getTextFromSelection,
  getSentenceFromSelection
} from 'get-selection-more'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { isTypeField, newSelectionWord } from './helper'

const isFirefox = navigator.userAgent.includes('Firefox')

export function createSelectTextStream(config: AppConfig | null) {
  if (!config) {
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

  const isMouseDown$ = merge(
    mapTo(true)(mousedown$),
    mapTo(false)(mouseup$),
    mapTo(false)(fromEvent(window, 'mouseout', { capture: true })),
    mapTo(false)(fromEvent(window, 'blur', { capture: true }))
  )

  return fromEvent(document, 'selectionchange').pipe(
    withLatestFrom(isMouseDown$),
    debounce(([, isWithMouse]) => (isWithMouse ? mouseup$ : timer(400))),
    map(([, isWithMouse]) => [window.getSelection(), isWithMouse] as const),
    filter(
      (args): args is [Selection, boolean] =>
        !!args[0] && !isInSaladictExternal(args[0].anchorNode)
    ),
    withLatestFrom(mouseup$, mousedown$, clickPeriodCount$),
    map(([[selection, isWithMouse], mouseup, mousedown, clickPeriodCount]) => {
      const self = isInDictPanel(selection.anchorNode || mousedown.target)

      if (
        config.noTypeField &&
        isTypeField(isWithMouse ? mousedown.target : selection.anchorNode)
      ) {
        return self
      }

      const text = getTextFromSelection(selection)

      if (!checkSupportedLangs(config.language, text)) {
        return self
      }

      if (isWithMouse) {
        return {
          word: newSelectionWord({
            text,
            context: getSentenceFromSelection(selection)
          }),
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

      if (
        rect.top === 0 &&
        rect.left === 0 &&
        rect.width === 0 &&
        rect.height === 0
      ) {
        // Selection is made inside textarea with keyborad. Ignore.
        return self
      }

      return {
        word: newSelectionWord({
          text,
          context: getSentenceFromSelection(selection)
        }),
        self,
        dbClick: clickPeriodCount >= 2,
        mouseX: rect.right,
        mouseY: rect.top
      }
    }),
    throttle(result => {
      // Firefox will fire an extra selectionchange event
      // when selection is made inside dict panel and
      // continute search is triggered.
      // Need to skip this event otherwise the panel is
      // closed unexpectedly.
      if (
        isFirefox &&
        typeof result !== 'boolean' &&
        result.self &&
        result.word &&
        result.word.text
      ) {
        const { direct, double, holding } = config.panelMode
        if (
          direct ||
          (double && result.dbClick) ||
          (holding.shift && result.shiftKey) ||
          (holding.ctrl && result.ctrlKey) ||
          (holding.meta && result.metaKey)
        ) {
          return timer(500)
        }
      }
      return timer(0)
    })
  )
}
