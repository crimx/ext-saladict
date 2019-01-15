import { AppConfig } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import * as selection from '@/_helpers/selection'
import {
  MsgType,
  MsgIsPinned,
  MsgQueryQSPanel,
  MsgQSPanelIDChanged,
  MsgQueryQSPanelResponse,
} from '@/typings/message'
import {
  config$$,
  sendMessage,
  isBlacklisted,
  isSelectionLangValid,
  isInPanelOnInternalPage,
} from './helper'
import { validMouseup$$ } from './mouse-events'

import { combineLatest } from 'rxjs/observable/combineLatest'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { merge } from 'rxjs/observable/merge'
import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operators/map'
import { mapTo } from 'rxjs/operators/mapTo'
import { pluck } from 'rxjs/operators/pluck'
import { filter } from 'rxjs/operators/filter'
import { startWith } from 'rxjs/operators/startWith'
import { switchMap } from 'rxjs/operators/switchMap'
import { debounceTime } from 'rxjs/operators/debounceTime'
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isNoSelectionPage = isSaladictOptionsPage || isSaladictPopupPage

/**
 * Cursor Instant Capture
 */
combineLatest(
  config$$,
  message.self.createStream<MsgIsPinned>(MsgType.IsPinned).pipe(
    pluck<MsgIsPinned, MsgIsPinned['isPinned']>('isPinned'),
    startWith(false),
  ),
  merge(
    fromPromise(message.send<MsgQueryQSPanel, MsgQueryQSPanelResponse>({ type: MsgType.QueryQSPanel })),
    message.createStream<MsgQSPanelIDChanged>(MsgType.QSPanelIDChanged).pipe(
      pluck<MsgQSPanelIDChanged, MsgQSPanelIDChanged['flag']>('flag'),
      startWith(false),
    ),
  ),
).pipe(
  map(([config, isPinned, withQSPanel]) => {
    const { instant } = config[
      withQSPanel
        ? 'qsPanelMode'
        : (isNoSelectionPage || window.name === 'saladict-dictpanel')
          ? 'panelMode'
          : isPinned ? 'pinMode' : 'mode'
    ]
    return [
      instant.enable ? instant.key : '',
      instant.delay,
      config,
    ] as ['' | AppConfig['mode']['instant']['key'], number, AppConfig]
  }),
  distinctUntilChanged((oldVal, newVal) => oldVal[0] === newVal[0] && oldVal[1] === newVal[1]),
  switchMap(([instant, insCapDelay, config]) => {
    if (!instant || window.name === 'saladict-wordeditor' || isBlacklisted(config)) {
      return of(null)
    }
    return merge(
      mapTo(null)(validMouseup$$),
      mapTo(null)(fromEvent(window, 'mouseout', { capture: true })),
      fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).pipe(
        map(e => {
          if ((instant === 'direct' && !(e.ctrlKey || e.metaKey || e.altKey)) ||
            (instant === 'alt' && e.altKey) ||
            (instant === 'shift' && e.shiftKey) ||
            (instant === 'ctrl' && (e.ctrlKey || e.metaKey))
          ) {
            // harmless side effects
            selectCursorWord(e)
            return [e, config] as [MouseEvent, AppConfig]
          }
          return null
        }),
    )).pipe(
      debounceTime(insCapDelay),
    )
  }),
  filter((args): args is [MouseEvent, AppConfig] => Boolean(args)),
  map(args => {
    return [
      args,
      {
        text: selection.getSelectionText(),
        context: selection.getSelectionSentence(),
      }
    ] as [typeof args, { text: string, context: string }]
  }),
  distinctUntilChanged((oldVal, newVal) => (
    oldVal[1].text === newVal[1].text &&
    oldVal[1].context === newVal[1].context
  )),
).subscribe(([[event, config], partialSelInfo]) => {
  if (isSelectionLangValid(partialSelInfo.text, config.language)) {
    sendMessage({
      mouseX: event.clientX,
      mouseY: event.clientY,
      instant: true,
      self: isSaladictInternalPage ? isInPanelOnInternalPage(event) : window.name === 'saladict-dictpanel',
      selectionInfo: selection.getSelectionInfo(partialSelInfo),
    })
  }
})

/**
 * Select the word under the cursor position
 */
function selectCursorWord (e: MouseEvent): void {
  const x = e.clientX
  const y = e.clientY

  let offsetNode: Node
  let offset: number

  const sel = window.getSelection()
  sel.removeAllRanges()

  if (document['caretPositionFromPoint']) {
    const pos = document['caretPositionFromPoint'](x, y)
    if (!pos) { return }
    offsetNode = pos.offsetNode
    offset = pos.offset
  } else if (document['caretRangeFromPoint']) {
    const pos = document['caretRangeFromPoint'](x, y)
    if (!pos) { return }
    offsetNode = pos.startContainer
    offset = pos.startOffset
  } else {
    return
  }

  if (offsetNode.nodeType === Node.TEXT_NODE) {
    const textNode = offsetNode as Text
    const content = textNode.data
    const head = (content.slice(0, offset).match(/[-_a-z]+$/i) || [''])[0]
    const tail = (content.slice(offset).match(/^([-_a-z]+|[\u4e00-\u9fa5])/i) || [''])[0]
    if (head.length <= 0 && tail.length <= 0) {
      return
    }

    const range = document.createRange()
    range.setStart(textNode, offset - head.length)
    range.setEnd(textNode, offset + tail.length)
    const rangeRect = range.getBoundingClientRect()

    if (rangeRect.left <= x &&
        rangeRect.right >= x &&
        rangeRect.top <= y &&
        rangeRect.bottom >= y
    ) {
      sel.addRange(range)
      if (sel['modify']) {
        sel['modify']('move', 'backward', 'word')
        sel.collapseToStart()
        sel['modify']('extend', 'forward', 'word')
      }
    }

    range.detach()
  }
}
