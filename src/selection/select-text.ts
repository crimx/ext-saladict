import { empty, fromEvent, merge, timer, Observable } from 'rxjs'
import {
  withLatestFrom,
  filter,
  map,
  mapTo,
  debounce,
  switchMap,
  scan,
  startWith,
  throttle,
  delay,
  distinctUntilChanged
} from 'rxjs/operators'
import {
  useObservable,
  useObservableCallback,
  identity,
  useSubscription
} from 'observable-hooks'
import { AppConfig } from '@/app-config'
import {
  isInDictPanel,
  isInSaladictExternal,
  isFirefox
} from '@/_helpers/saladict'
import {
  getTextFromSelection,
  getSentenceFromSelection
} from 'get-selection-more'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { Message } from '@/typings/message'
import { isTypeField, newSelectionWord } from './helper'

export function createSelectTextStream(config: AppConfig | null) {
  if (!config) {
    return empty()
  }

  return config.touchMode ? withTouchMode(config) : withoutTouchMode(config)
}

function withTouchMode(config: AppConfig) {
  const mousedown$ = merge(
    fromEvent<MouseEvent>(window, 'mousedown', { capture: true }).pipe(
      filter(e => e.button === 0)
    ),
    fromEvent<TouchEvent>(window, 'touchstart', { capture: true }).pipe(
      map(e => e.changedTouches[0])
    )
  )

  const mouseup$ = merge(
    fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).pipe(
      filter(e => e.button === 0)
    ),
    fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(
      map(e => e.changedTouches[0])
    )
  )

  const clickPeriodCount$ = clickPeriodCountStream(
    mouseup$,
    config.doubleClickDelay
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
        return { self }
      }

      const text = getTextFromSelection(selection)

      if (!checkSupportedLangs(config.language, text)) {
        return { self }
      }

      if (isWithMouse) {
        return {
          word: {
            text,
            context: getSentenceFromSelection(selection)
          },
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
        return { self }
      }

      return {
        word: {
          text,
          context: getSentenceFromSelection(selection)
        },
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
      if (isFirefox && result.self && result.word && result.word.text) {
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

function withoutTouchMode(config: AppConfig) {
  const mousedown$ = fromEvent<MouseEvent>(window, 'mousedown', {
    capture: true
  }).pipe(filter(e => e.button === 0))

  const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup', {
    capture: true
  }).pipe(filter(e => e.button === 0))

  const clickPeriodCount$ = clickPeriodCountStream(
    mouseup$,
    config.doubleClickDelay
  )

  return mouseup$.pipe(
    filter(e => !isInSaladictExternal(e.target)),
    // if user click on a selected text,
    // getSelection would reture the text before the highlight disappears
    // delay to wait for selection get cleared
    delay(10),
    withLatestFrom(mousedown$, clickPeriodCount$),
    // handle in-panel search separately
    // due to tricky shadow dom event retarget
    filter(
      ([mouseup, mousedown]) =>
        !isInDictPanel(mouseup.target) && !isInDictPanel(mousedown.target)
    ),
    map(([mouseup, mousedown, clickPeriodCount]) => {
      if (config.noTypeField && isTypeField(mousedown.target)) {
        return { self: false }
      }

      const selection = window.getSelection()
      const text = getTextFromSelection(selection)

      if (!checkSupportedLangs(config.language, text)) {
        return { self: false }
      }

      return {
        word: {
          text,
          context: getSentenceFromSelection(selection)
        },
        self: false,
        dbClick: clickPeriodCount >= 2,
        mouseX: mouseup.clientX,
        mouseY: mouseup.clientY,
        shiftKey: mouseup.shiftKey,
        ctrlKey: mouseup.ctrlKey,
        metaKey: mouseup.metaKey
      }
    }),
    distinctUntilChanged((oldVal, newVal) => {
      // (Ignore this rule if it is a double click.)
      // Same selection. This could be caused by other widget on the page
      // that uses preventDefault which stops selection being cleared when clicked.
      // Ignore it so that the panel won't follow.
      return (
        !newVal.dbClick &&
        !!oldVal.word &&
        !!newVal.word &&
        oldVal.word.text === newVal.word.text &&
        oldVal.word.context === newVal.word.context
      )
    })
  )
}

export function useInPanelSelect(
  touchMode: AppConfig['touchMode'],
  language: AppConfig['language'],
  doubleClickDelay: AppConfig['doubleClickDelay'],
  newSelection: (payload: Message<'SELECTION'>['payload']) => void
) {
  const [onMouseUp, mouseUp$] = useObservableCallback<React.MouseEvent>(
    event$ => event$.pipe(filter(e => e.button === 0))
  )

  const config$ = useObservable(identity, [touchMode, language] as const)

  const clickPeriodCount$ = useObservable(
    inputs$ =>
      inputs$.pipe(
        switchMap(([doubleClickDelay]) =>
          clickPeriodCountStream(mouseUp$, doubleClickDelay)
        )
      ),
    [doubleClickDelay] as const
  )

  const output$ = useObservable(() =>
    mouseUp$.pipe(
      withLatestFrom(config$),
      filter(([mouseup, [touchMode]]) => {
        if (touchMode) {
          return false
        }

        for (
          let el = mouseup.target as HTMLElement | null;
          el;
          el = el.parentElement
        ) {
          if (el.tagName === 'A' || el.tagName === 'BUTTON') {
            return false
          }
        }

        return true
      }),
      map(([mouseup, [, language]]) => ({
        mouseup: mouseup.nativeEvent,
        language
      })),
      delay(10),
      withLatestFrom(clickPeriodCount$),
      map(([{ mouseup, language }, clickPeriodCount]) => {
        const selection = window.getSelection()
        const text = getTextFromSelection(selection)

        return checkSupportedLangs(language, text)
          ? {
              word: {
                text,
                context: getSentenceFromSelection(selection)
              },
              dbClick: clickPeriodCount >= 2,
              mouseX: mouseup.clientX,
              mouseY: mouseup.clientY,
              shiftKey: mouseup.shiftKey,
              ctrlKey: mouseup.ctrlKey,
              metaKey: mouseup.metaKey,
              self: true,
              instant: false,
              force: false
            }
          : {
              word: null,
              self: true,
              mouseX: 0,
              mouseY: 0,
              dbClick: false,
              shiftKey: false,
              ctrlKey: false,
              metaKey: false,
              instant: false,
              force: false
            }
      }),
      distinctUntilChanged((oldVal, newVal) => {
        return (
          !newVal.dbClick &&
          !!oldVal.word &&
          !!newVal.word &&
          oldVal.word.text === newVal.word.text &&
          oldVal.word.context === newVal.word.context
        )
      })
    )
  )

  useSubscription(output$, async result => {
    if (result.word) {
      result.word = await newSelectionWord(result.word)
    }
    newSelection(result as Message<'SELECTION'>['payload'])
  })

  return onMouseUp
}

function clickPeriodCountStream(
  mouseup$: Observable<MouseEvent | Touch | React.MouseEvent>,
  doubleClickDelay: number
) {
  return mouseup$.pipe(
    switchMap(() =>
      timer(doubleClickDelay).pipe(mapTo(false), startWith(true))
    ),
    scan((sum: number, flag: boolean) => (flag ? sum + 1 : 0), 0)
  )
}
