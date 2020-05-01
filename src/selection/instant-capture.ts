import {
  getTextFromSelection,
  getSentenceFromSelection
} from 'get-selection-more'
import { AppConfig } from '@/app-config'
import { isStandalonePage, isInDictPanel } from '@/_helpers/saladict'
import { checkSupportedLangs } from '@/_helpers/lang-check'
import { message } from '@/_helpers/browser-api'

import { fromEvent, merge, of, timer, combineLatest, empty, from } from 'rxjs'
import {
  map,
  mapTo,
  filter,
  switchMap,
  distinctUntilChanged,
  debounce,
  pluck,
  startWith
} from 'rxjs/operators'

/**
 * Create an instant capture Observable
 */
export function createIntantCaptureStream(config: AppConfig | null) {
  if (!config) return empty()

  const isPinned$ = message.self
    .createStream('PIN_STATE')
    .pipe(pluck('payload'), startWith(false))

  const responseToQSPanel$ = merge(
    // When Quick Search Panel show and hide
    from(
      message.send<'QUERY_QS_PANEL'>({ type: 'QUERY_QS_PANEL' })
    ),
    message.createStream('QS_PANEL_CHANGED').pipe(pluck('payload'))
  ).pipe(
    map(withQssaPanel => withQssaPanel && config.qssaPageSel),
    startWith(false)
  )

  return combineLatest(isPinned$, responseToQSPanel$).pipe(
    switchMap(([isPinned, responseToQSPanel]) => {
      const { instant: panelInstant } = config.panelMode
      const { instant: otherInstant } = config[
        responseToQSPanel ? 'qsPanelMode' : isPinned ? 'pinMode' : 'mode'
      ]

      if (!panelInstant.enable && !otherInstant.enable) {
        return of(null)
      }

      // Reduce GC
      // Only the latest result is used so it's safe to reuse the object
      const reuseObj = ({} as unknown) as {
        event: MouseEvent
        self: boolean
      }

      return merge(
        mapTo(null)(fromEvent(window, 'mouseup', { capture: true })),
        mapTo(null)(fromEvent(window, 'mouseout', { capture: true })),
        mapTo(null)(fromEvent(window, 'keyup', { capture: true })),
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
                reuseObj.event = event
                reuseObj.self = self
                return reuseObj
              }
            }
            return null
          })
        )
      ).pipe(
        // distinctUntilChanged((oldObj, newObj) =>
        //   Boolean(
        //     oldObj &&
        //       newObj &&
        //       Math.abs(oldObj.event.clientX - newObj.event.clientX) <= 1 &&
        //       Math.abs(oldObj.event.clientY - newObj.event.clientY) <= 1
        //   )
        // ),
        debounce(obj =>
          obj ? timer(obj.self ? panelInstant.delay : otherInstant.delay) : of()
        )
      )
    }),
    map(obj => obj && { word: getCursorWord(obj.event), ...obj }),
    distinctUntilChanged((oldObj, newObj) => {
      if (!oldObj || !newObj) return false
      const { word: oldWord, event: oldEvent } = oldObj
      const { word: newWord, event: newEvent } = newObj
      return (
        oldWord?.text === newWord?.text &&
        oldWord?.context === newWord?.context &&
        oldEvent.shiftKey === newEvent.shiftKey &&
        oldEvent.ctrlKey === newEvent.ctrlKey &&
        oldEvent.metaKey === newEvent.metaKey &&
        oldEvent.altKey === newEvent.altKey
      )
    }),
    filter((obj): obj is {
      word: { text: string; context: string }
      event: MouseEvent
      config: AppConfig
      self: boolean
    } =>
      Boolean(
        obj && obj.word && checkSupportedLangs(config.language, obj.word.text)
      )
    )
  )
}

function getCursorWord(
  event: MouseEvent
): { text: string; context: string } | null {
  const x = event.clientX
  const y = event.clientY

  let offsetNode: Node
  let offset: number
  let originRange: Range | undefined

  const sel = window.getSelection()
  if (!sel) return null
  if (sel.rangeCount > 0) {
    originRange = sel.getRangeAt(0)
    sel.removeAllRanges()
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

    const text = getTextFromSelection(sel)
    const context = getSentenceFromSelection(sel)

    sel.removeAllRanges()
    if (originRange) {
      sel.addRange(originRange)
    }
    range.detach()

    return text ? { text, context } : null
  }

  return null
}
