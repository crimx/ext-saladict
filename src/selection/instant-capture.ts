import { getText, getSentence } from 'get-selection-more'
import { AppConfig } from '@/app-config'
import { isStandalonePage, isInDictPanel } from '@/_helpers/saladict'
import { message } from '@/_helpers/browser-api'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { Word, newWord } from '@/_helpers/record-manager'

import { combineLatest, from, fromEvent, merge, of, Observable } from 'rxjs'
import {
  map,
  mapTo,
  pluck,
  filter,
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  share
} from 'rxjs/operators'

import { isBlacklisted } from './helper'

export function getIntantCapture$(
  config$: Observable<AppConfig>,
  validMouseup$: Observable<any>
) {
  return combineLatest(
    config$,
    message.self.createStream('PIN_STATE').pipe(
      pluck('payload'),
      startWith(false)
    ),
    merge(
      // When Quick Search Panel show and hide
      from(message.send<'QUERY_QS_PANEL'>({ type: 'QUERY_QS_PANEL' })),
      message.createStream('QS_PANEL_CHANGED').pipe(
        pluck('payload'),
        startWith(false)
      )
    )
  ).pipe(
    switchMap(([config, isPinned, withQSPanel]) => {
      if (!isBlacklisted(config)) return of(null)

      const { instant: panelInstant } = config.panelMode
      const { instant: otherInstant } = config[
        withQSPanel ? 'qsPanelMode' : isPinned ? 'pinMode' : 'mode'
      ]

      if (!panelInstant.enable && !otherInstant.enable) {
        return of(null)
      }

      const cancelInstant$$ = share<null>()(
        merge(
          mapTo(null)(validMouseup$),
          mapTo(null)(fromEvent(window, 'mouseout', { capture: true }))
        )
      )

      return fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).pipe(
        // extra inner Observable to get debounceTime
        switchMap(event => {
          const self = isInDictPanel(event.target)
          const instant =
            self || isStandalonePage() ? panelInstant : otherInstant
          if (instant.enable) {
            if (
              (instant.key === 'alt' && event.altKey) ||
              (instant.key === 'shift' && event.shiftKey) ||
              (instant.key === 'ctrl' && (event.ctrlKey || event.metaKey)) ||
              (instant.key === 'direct' &&
                !(event.ctrlKey || event.metaKey || event.altKey))
            ) {
              return cancelInstant$$.pipe(
                startWith([event, config, self] as const),
                debounceTime(instant.delay)
              )
            }
          }
          return of(null)
        })
      )
    }),
    map(
      args =>
        args &&
        ([getCursorWord(args[0]), ...args] as
          | null
          | [Word | null, MouseEvent, AppConfig, boolean])
    ),
    filter((args): args is [Word, MouseEvent, AppConfig, boolean] =>
      Boolean(
        args && args[0] && checkSupportedLangs(args[2].language, args[0].text)
      )
    ),
    distinctUntilChanged(
      ([oldWord], [newWord]) =>
        oldWord.text === newWord.text && oldWord.context === newWord.context
    )
  )
}

function getCursorWord(event: MouseEvent): Word | null {
  const x = event.clientX
  const y = event.clientY

  let offsetNode: Node
  let offset: number
  let originRange: Range | undefined

  const sel = window.getSelection()
  if (!sel) return null
  if (sel.rangeCount > 0) {
    originRange = sel.getRangeAt(0)
  }

  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y)
    if (!pos) return null
    offsetNode = pos.offsetNode
    offset = pos.offset
  } else if (document.caretRangeFromPoint) {
    const pos = document.caretRangeFromPoint(x, y)
    if (!pos) return null
    offsetNode = pos.startContainer
    offset = pos.startOffset
  } else {
    return null
  }

  if (offsetNode.nodeType === Node.TEXT_NODE) {
    const textNode = offsetNode as Text
    const content = textNode.data
    const head = (content.slice(0, offset).match(/[-_a-z]+$/i) || [''])[0]
    const tail = (content
      .slice(offset)
      .match(/^([-_a-z]+|[\u4e00-\u9fa5])/i) || [''])[0]
    if (head.length <= 0 && tail.length <= 0) {
      return null
    }

    const range = document.createRange()
    range.setStart(textNode, offset - head.length)
    range.setEnd(textNode, offset + tail.length)
    const rangeRect = range.getBoundingClientRect()

    if (
      rangeRect.left <= x &&
      rangeRect.right >= x &&
      rangeRect.top <= y &&
      rangeRect.bottom >= y
    ) {
      sel.removeAllRanges()
      sel.addRange(range)
      if (sel['modify']) {
        sel['modify']('move', 'backward', 'word')
        sel.collapseToStart()
        sel['modify']('extend', 'forward', 'word')
      }
    }

    const text = getText()
    const context = getSentence()

    if (originRange) {
      sel.removeAllRanges()
      sel.addRange(originRange)
    }
    range.detach()

    return text ? newWord({ text, context }) : null
  }

  return null
}
