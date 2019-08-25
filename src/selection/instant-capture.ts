import { getText, getSentence } from 'get-selection-more'
import { AppConfig } from '@/app-config'
import { isStandalonePage, isInDictPanel } from '@/_helpers/saladict'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { Word, newWord } from '@/_helpers/record-manager'

import { fromEvent, merge, of, Observable, timer } from 'rxjs'
import {
  map,
  mapTo,
  filter,
  switchMap,
  distinctUntilChanged,
  debounce
} from 'rxjs/operators'

import { isBlacklisted } from './helper'

/**
 * Create an instant capture Observable
 * @param input$ Observable of app config,
 *  is panel pinned, and is the Quick Search Panel showing.
 */
export function createIntantCaptureStream(
  input$: Observable<Readonly<[AppConfig, boolean, boolean]>>
) {
  return input$.pipe(
    switchMap(([config, isPinned, withQSPanel]) => {
      if (isBlacklisted(config)) return of(null)

      const { instant: panelInstant } = config.panelMode
      const { instant: otherInstant } = config[
        withQSPanel ? 'qsPanelMode' : isPinned ? 'pinMode' : 'mode'
      ]

      if (!panelInstant.enable && !otherInstant.enable) {
        return of(null)
      }

      // Reduce GC
      // Only the latest result is used so it's safe to reuse the array
      const reuseTuple = ([] as unknown) as [MouseEvent, AppConfig, boolean]

      return merge(
        mapTo(null)(fromEvent(window, 'mouseup', { capture: true })),
        mapTo(null)(fromEvent(window, 'mouseout', { capture: true })),
        fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).pipe(
          map(event => {
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
                reuseTuple[0] = event
                reuseTuple[1] = config
                reuseTuple[2] = self
                return reuseTuple
              }
            }
            return null
          })
        )
      ).pipe(
        debounce(arg =>
          arg ? timer(arg[2] ? panelInstant.delay : otherInstant.delay) : of()
        )
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

    sel.removeAllRanges()
    if (originRange) {
      sel.addRange(originRange)
    }
    range.detach()

    return text ? newWord({ text, context }) : null
  }

  return null
}
