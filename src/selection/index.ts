import { appConfigFactory, AppConfig } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { isContainChinese, isContainEnglish, isContainMinor } from '@/_helpers/lang-check'
import { createAppConfigStream } from '@/_helpers/config-manager'
import * as selection from '@/_helpers/selection'
import { MsgType, PostMsgType, PostMsgSelection, MsgSelection, MsgIsPinned } from '@/typings/message'
import { Mutable } from '@/typings/helpers'

// import { Observable, fromEvent, timer, merge, of, asyncScheduler } from 'rxjs'
// import { map, mapTo, scan, filter, take, switchMap, buffer, debounceTime, observeOn, share, distinctUntilChanged } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { timer } from 'rxjs/observable/timer'
import { merge } from 'rxjs/observable/merge'
import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operators/map'
import { delay } from 'rxjs/operators/delay'
import { mapTo } from 'rxjs/operators/mapTo'
import { scan } from 'rxjs/operators/scan'
import { filter } from 'rxjs/operators/filter'
import { take } from 'rxjs/operators/take'
import { switchMap } from 'rxjs/operators/switchMap'
import { buffer } from 'rxjs/operators/buffer'
import { debounceTime } from 'rxjs/operators/debounceTime'
import { share } from 'rxjs/operators/share'
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged'
import { startWith } from 'rxjs/operators/startWith'
import { pluck } from 'rxjs/operators/pluck'
import { combineLatest } from 'rxjs/observable/combineLatest'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isNoSelectionPage = isSaladictOptionsPage || isSaladictPopupPage

let config = appConfigFactory()
createAppConfigStream().subscribe(newConfig => config = newConfig)

let clickPeriodCount = 0
let lastMousedownEvent: MouseEvent | TouchEvent | null

/**
 * Beware that this is run on every frame
 */
message.addListener(msg => {
  switch (msg.type) {
    case MsgType.PreloadSelection:
      if (selection.getSelectionText()) {
        return Promise.resolve(selection.getSelectionInfo())
      }
      break
    case MsgType.EmitSelection:
      if (lastMousedownEvent) {
        const text = selection.getSelectionText()
        if (text) {
          const { clientX, clientY } = lastMousedownEvent instanceof MouseEvent
            ? lastMousedownEvent
            : lastMousedownEvent.changedTouches[0]
          sendMessage({
            mouseX: clientX,
            mouseY: clientY,
            instant: true,
            self: isSaladictInternalPage
              ? isInPanelOnInternalPage(lastMousedownEvent)
              : window.name === 'saladict-dictpanel',
            selectionInfo: selection.getSelectionInfo({ text }),
          })
        }
      }
      break
    default:
      break
  }
})

/** Pass through message from iframes */
window.addEventListener('message', ({ data, source }: { data: PostMsgSelection, source: Window | null }) => {
  if (data.type !== PostMsgType.Selection) { return }

  // get the souce iframe
  const iframe = Array.from(document.querySelectorAll('iframe'))
    .find(({ contentWindow }) => contentWindow === source)
  if (!iframe) { return }

  const { left, top } = iframe.getBoundingClientRect()
  const msg: Mutable<typeof data> = data
  msg.mouseX = msg.mouseX + left
  msg.mouseY = msg.mouseY + top
  sendMessage(msg)
})

if (!window.name.startsWith('saladict-') && !isSaladictOptionsPage) {
  /**
   * Pressing ctrl/command key more than three times within 500ms
   * trigers TripleCtrl
   */
  const ctrlPressed$$ = share<true>()(isKeyPressed(isCtrlKey))

  ctrlPressed$$.pipe(
    buffer(merge(
      debounceTime(500)(ctrlPressed$$), // collect after 0.5s
      isKeyPressed(e => !isCtrlKey(e)), // other key pressed
    )),
    filter(group => group.length >= 3),
  ).subscribe(() => {
    message.self.send({ type: MsgType.TripleCtrl })
  })
}

/**
 * Track the last mousedown target for identifying input field, if needed.
 */
merge(
  fromEvent<MouseEvent>(window, 'mousedown', { capture: true }),
  fromEvent<TouchEvent>(window, 'touchstart', { capture: true }),
).subscribe(evt => {
  lastMousedownEvent = evt
})

/**
 * A valid mouseup:
 * 1. Not in Saladict iframe.
 * 2. Event target is not a Saladict exposed element.
 */
const validMouseup$$ = merge(
  fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).pipe(
    filter(e => e.button === 0)
  ),
  fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(
    map(e => e.changedTouches[0])
  ),
).pipe(
  filter(({ target }) => {
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
merge(
  mapTo(true)(validMouseup$$),
  switchMap(() => timer(config.doubleClickDelay).pipe(take(1), mapTo(false)))(validMouseup$$)
).pipe(
  scan((sum: number, flag: boolean) => flag ? sum + 1 : 0, 0)
).subscribe(count => {
  clickPeriodCount = count
})

/**
 * Escape key pressed
 */
isKeyPressed(isEscapeKey).subscribe(() => message.self.send({ type: MsgType.EscapeKey }))

let lastText: string
let lastContext: string
validMouseup$$.subscribe(event => {
  if (isNoSelectionPage && !isInPanelOnInternalPage(lastMousedownEvent)) {
    return
  }

  const isDictPanel = isSaladictInternalPage
    ? isInPanelOnInternalPage(lastMousedownEvent)
    : window.name === 'saladict-dictpanel'

  if (config.noTypeField && isTypeField(lastMousedownEvent)) {
    sendEmptyMessage(isDictPanel)
    return
  }

  const text = selection.getSelectionText()
  const { english, chinese, minor } = config.language
  if (
    text && (
      (english && isContainEnglish(text) && !isContainChinese(text)) ||
      (chinese && isContainChinese(text)) ||
      (minor && isContainMinor(text))
    )
  ) {
    const context = selection.getSelectionSentence()
    if (text === lastText && context === lastContext && clickPeriodCount < 2) {
      // (Ignore this rule if it is a double click.)
      // Same selection. This could be caused by other widget on the page
      // that uses preventDefault which stops selection being cleared when clicked.
      // Ignore it so that the panel won't follow.
      return
    }
    lastContext = context

    sendMessage({
      mouseX: event.clientX,
      mouseY: event.clientY,
      dbClick: clickPeriodCount >= 2,
      ctrlKey: Boolean(event['metaKey'] || event['ctrlKey']),
      self: isDictPanel,
      selectionInfo: selection.getSelectionInfo({ context })
    })
  } else {
    lastContext = ''
    sendEmptyMessage(isDictPanel)
  }
  // always update text
  lastText = text
})

/**
 * Cursor Instant Capture
 */
combineLatest(
  createAppConfigStream(),
  message.self.createStream<MsgIsPinned>(MsgType.IsPinned).pipe(
    pluck<MsgIsPinned, MsgIsPinned['isPinned']>('isPinned'),
    startWith(false),
  ),
).pipe(
  map(([config, isPinned]): ['' | AppConfig['mode']['instant']['key'], number] => {
    const { instant } = config[
      (isNoSelectionPage || window.name === 'saladict-dictpanel')
        ? 'panelMode'
        : isPinned ? 'pinMode' : 'mode'
    ]
    return [
      instant.enable ? instant.key : '',
      instant.delay
    ]
  }),
  distinctUntilChanged((oldVal, newVal) => oldVal[0] === newVal[0] && oldVal[1] === newVal[1]),
  switchMap(([instant, insCapDelay]) => {
    if (!instant || window.name === 'saladict-wordeditor') { return of(undefined) }
    return merge(
      validMouseup$$.pipe(mapTo(undefined)),
      fromEvent<MouseEvent>(window, 'mouseout', { capture: true }).pipe(mapTo(undefined)),
      fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).pipe(map(e => {
        if ((instant === 'direct' && !(e.ctrlKey || e.metaKey || e.altKey)) ||
            (instant === 'alt' && e.altKey) ||
            (instant === 'ctrl' && (e.ctrlKey || e.metaKey))
        ) {
          // harmless side effects
          selectCursorWord(e)
          return e
        }
        return undefined
      }),
    )).pipe(
      debounceTime(insCapDelay),
    )
  }),
  map(e => {
    return [
      e,
      e ? selection.getSelectionText() : '',
      e ? selection.getSelectionSentence() : '',
    ] as [MouseEvent | undefined, string, string]
  }),
  distinctUntilChanged((oldVal, newVal) => oldVal[1] === newVal[1] && oldVal[2] === newVal[2]),
  filter((args): args is [MouseEvent, string, string] => args[0] as any as boolean),
).subscribe(([event, text, context]) => {
  if (text) {
    sendMessage({
      mouseX: event.clientX,
      mouseY: event.clientY,
      instant: true,
      self: isSaladictInternalPage ? isInPanelOnInternalPage(event) : window.name === 'saladict-dictpanel',
      selectionInfo: selection.getSelectionInfo({ text, context }),
    })
  }
})

/*-----------------------------------------------*\
    Helpers
\*-----------------------------------------------*/

function sendMessage (
  msg: {
    selectionInfo: selection.SelectionInfo
    mouseX: number
    mouseY: number
    self: boolean
    dbClick?: boolean
    ctrlKey?: boolean
    instant?: boolean
  }
) {
  if (window.parent === window) {
    // top
    if (process.env.NODE_ENV === 'development') {
      console.log('New selection', msg)
    }

    message.self.send<MsgSelection>({
      ...msg,
      type: MsgType.Selection,
    })
  } else {
    // post to upper frames/window
    window.parent.postMessage({
      ...msg,
      type: PostMsgType.Selection,
    } as PostMsgSelection, '*')
  }
}

function sendEmptyMessage (isDictPanel: boolean) {
  // empty message
  const msg: MsgSelection = {
    type: MsgType.Selection,
    selectionInfo: selection.getDefaultSelectionInfo(),
    self: isDictPanel,
    mouseX: 0,
    mouseY: 0,
    dbClick: false,
    ctrlKey: false,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('New selection', msg)
  }

  message.self.send(msg)
}

/**
 * Is ctrl/command button pressed
 */
function isCtrlKey (evt: KeyboardEvent): boolean {
  return evt.key === 'Control' || evt.key === 'Meta'
}

/**
 * Is esc button pressed
 */
function isEscapeKey (evt: KeyboardEvent): boolean {
  return evt.key === 'Escape'
}

function isKeyPressed (keySelectior: (e: KeyboardEvent) => boolean): Observable<true> {
  return merge(
    map(keySelectior)(fromEvent<KeyboardEvent>(window, 'keydown', { capture: true })),
    mapTo(false)(fromEvent(window, 'keyup', { capture: true })),
    mapTo(false)(fromEvent(window, 'blur', { capture: true })),
    of(false),
  ).pipe(
    distinctUntilChanged(), // ignore long press
    filter((x): x is true => x),
  )
}

function isTypeField (event: MouseEvent | TouchEvent | null): boolean {
  if (event && event.target) {
    const target = event.target
    if (target['tagName'] === 'INPUT' || target['tagName'] === 'TEXTAREA') {
      return true
    }

    const editorTester = /CodeMirror|ace_editor|monaco-editor/
    // Popular code editors CodeMirror, ACE and Monaco
    for (let el = target as Element | null; el; el = el.parentElement) {
      // With CodeMirror the `pre.CodeMirror-line` somehow got detached when the event
      // triggerd. So el will never reach the root `.CodeMirror`.
      if (editorTester.test(el.className)) {
        return true
      }
    }
  }

  return false
}

/**
 * Is inside dict panel on a Saladict internal page
 */
function isInPanelOnInternalPage (event: MouseEvent | TouchEvent | null): boolean {
  if (event && event.target) {
    const target = event.target
    if (target['classList']) {
      for (let el = target as Element | null; el; el = el.parentElement) {
        if (el.classList.contains('saladict-DictPanel')) {
          return true
        }
      }
    }
  }
  return false
}

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
    }

    range.detach()
  }
}
