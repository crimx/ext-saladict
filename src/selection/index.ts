import { appConfigFactory } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { createAppConfigStream } from '@/_helpers/config-manager'
import * as selection from '@/_helpers/selection'
import { MsgType, PostMsgType, PostMsgSelection, MsgSelection } from '@/typings/message'

import { Observable, fromEvent, timer, merge, of, asyncScheduler } from 'rxjs'
import { map, mapTo, scan, filter, take, switchMap, buffer, debounceTime, observeOn, share, distinctUntilChanged } from 'rxjs/operators'

message.addListener(MsgType.__PreloadSelection__, (data, sender) => {
  return Promise.resolve(selection.getSelectionInfo())
})

/** Pass through message from iframes */
window.addEventListener('message', ({ data, source }: { data: PostMsgSelection, source: Window | null }) => {
  if (data.type !== PostMsgType.Selection) { return }

  // get the souce iframe
  const iframe = Array.from(document.querySelectorAll('iframe'))
    .find(({ contentWindow }) => contentWindow === source)
  if (!iframe) { return }

  const { selectionInfo, mouseX, mouseY, ctrlKey, dbClick } = data
  const { left, top } = iframe.getBoundingClientRect()

  sendMessage(
    mouseX + left,
    mouseY + top,
    dbClick,
    ctrlKey,
    selectionInfo
  )
})

let config = appConfigFactory()
let isCtrlPressed = false
let clickPeriodCount = 0
let lastMousedownTarget: EventTarget | null

const isCtrlPressed$$ = share<boolean>()(isKeyPressed(isCtrlKey))

const validCtrlPressed$$ = isCtrlPressed$$.pipe(
  filter(isCtrlPressed => config.active && isCtrlPressed),
  share(),
)

const tripleCtrlPressed$ = validCtrlPressed$$.pipe(
  buffer(debounceTime(500)(validCtrlPressed$$)),
  filter(group => group.length >= 3),
)

merge(
  fromEvent<MouseEvent>(window, 'mousedown', { capture: true }),
  fromEvent<TouchEvent>(window, 'touchstart', { capture: true }),
).subscribe(({ target }) => {
  lastMousedownTarget = target
})

const validMouseup$$ = merge(
  fromEvent<MouseEvent>(window, 'mouseup', { capture: true }),
  fromEvent<TouchEvent>(window, 'touchend', { capture: true }).pipe(map(e => e.changedTouches[0])),
).pipe(
  filter(({ target }) => {
    if (!config.active || window.name === 'saladict-frame') {
      return false
    }

    if (target) {
      if (typeof target['className'] === 'string' && target['className'].startsWith('saladict-')) {
        return false
      }
    }

    return true
  }),
  // if user click on a selected text,
  // getSelection would reture the text before the highlight disappears
  // delay to wait for selection get cleared
  observeOn(asyncScheduler),
  share(),
)

const clickPeriodCount$ = merge(
  mapTo(true)(validMouseup$$),
  switchMap(() => timer(config.doubleClickDelay).pipe(take(1), mapTo(false)))(validMouseup$$)
).pipe(
  scan((sum: number, flag: boolean) => flag ? sum + 1 : 0, 0)
)

createAppConfigStream().subscribe(newConfig => config = newConfig)

isCtrlPressed$$.subscribe(flag => isCtrlPressed = flag)

isKeyPressed(isEscapeKey).subscribe(flag => {
  if (flag) {
    message.self.send({ type: MsgType.EscapeKey })
  }
})

clickPeriodCount$.subscribe(count => clickPeriodCount = count)

tripleCtrlPressed$.subscribe(() => {
  message.self.send({ type: MsgType.TripleCtrl })
})

let lastText: string
let lastContext: string
validMouseup$$.subscribe(({ clientX, clientY }) => {
  if (config.noTypeField && isTypeField(lastMousedownTarget)) {
    sendEmptyMessage()
    return
  }

  const text = selection.getSelectionText()
  if (
    text && (
      (config.language.english && isContainEnglish(text) && !isContainChinese(text)) ||
      (config.language.chinese && isContainChinese(text))
    )
  ) {
    const context = selection.getSelectionSentence()
    if (text === lastText && context === lastContext && clickPeriodCount < 2) {
      // Ignore this rule if it is a double click.
      // Same selection. This could be caused by other widget on the page
      // that uses preventDefault which stops selection being cleared when clicked.
      // Ignore it so that the panel won't follow.
      return
    }
    lastText = text
    lastContext = context

    sendMessage(
      clientX,
      clientY,
      clickPeriodCount >= 2,
      isCtrlPressed,
      {
        text: selection.getSelectionText(),
        context,
        title: window.pageTitle || document.title,
        url: window.pageURL || document.URL,
        favicon: window.faviconURL || '',
        trans: '',
        note: ''
      },
    )
  } else {
    sendEmptyMessage()
  }
})

function sendMessage (
  clientX: number,
  clientY: number,
  dbClick: boolean,
  isCtrlPressed: boolean,
  selectionInfo: selection.SelectionInfo
) {
  if (window.parent === window) {
    // top
    const msg: MsgSelection = {
      type: MsgType.Selection,
      selectionInfo,
      mouseX: clientX,
      mouseY: clientY,
      dbClick,
      ctrlKey: isCtrlPressed,
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('New selection', msg)
    }

    message.self.send(msg)
  } else {
    // post to upper frames/window
    window.parent.postMessage({
      type: PostMsgType.Selection,
      selectionInfo,
      mouseX: clientX,
      mouseY: clientY,
      dbClick,
      ctrlKey: isCtrlPressed,
    } as PostMsgSelection, '*')
  }
}

function sendEmptyMessage () {
  // empty message
  const msg: MsgSelection = {
    type: MsgType.Selection,
    selectionInfo: {
      text: '',
      context: '',
      title: window.pageTitle || document.title,
      url: window.pageURL || document.URL,
      // set by browser-api helper
      favicon: window.faviconURL || '',
      trans: '',
      note: ''
    },
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

function isKeyPressed (keySelectior: (e: KeyboardEvent) => boolean): Observable<boolean> {
  return distinctUntilChanged<boolean>()(
    merge(
      map(keySelectior)(fromEvent<KeyboardEvent>(window, 'keydown', { capture: true })),
      mapTo(false)(fromEvent(window, 'keyup', { capture: true })),
      mapTo(false)(fromEvent(window, 'blur', { capture: true })),
      of(false)
    )
  )
}

function isTypeField (traget: EventTarget | null): boolean {
  if (traget) {
    if (traget['tagName'] === 'INPUT' || traget['tagName'] === 'TEXTAREA') {
      return true
    }

    const editorTester = /CodeMirror|ace_editor/
    // Popular code editors CodeMirror and ACE
    for (let el = traget as Element | null; el; el = el.parentElement) {
      // With CodeMirror the `pre.CodeMirror-line` somehow got detached when the event
      // triggerd. So el will never reach the root `.CodeMirror`.
      if (editorTester.test(el.className)) {
        return true
      }
    }
  }

  return false
}
