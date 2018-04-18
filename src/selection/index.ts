import { appConfigFactory } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { createAppConfigStream } from '@/_helpers/config-manager'
import * as selection from '@/_helpers/selection'
import { MsgType, PostMsgType, PostMsgSelection, MsgSelection } from '@/typings/message'

import { Observable } from 'rxjs/Observable'
import { mapTo, scan, filter, take, switchMap, buffer, debounceTime, observeOn, share } from 'rxjs/operators'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { timer } from 'rxjs/observable/timer'
import { of } from 'rxjs/observable/of'
import { merge } from 'rxjs/observable/merge'
import { async } from 'rxjs/scheduler/async'

message.addListener(MsgType.__PreloadSelection__, (data, sender, sendResponse) => {
  sendResponse(selection.getSelectionInfo())
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

const isCtrlPressed$: Observable<boolean> = merge(
  fromEvent(window, 'keydown', true, e => isCtrlKey(e)),
  fromEvent(window, 'keyup', true, e => false),
  fromEvent(window, 'blur', true, e => false),
  of(false)
)

const validCtrlPressed$$ = isCtrlPressed$.pipe(
  filter(isCtrlPressed => config.active && isCtrlPressed),
  share(),
)

const tripleCtrlPressed$ = validCtrlPressed$$.pipe(
  buffer(debounceTime(500)(validCtrlPressed$$)),
  filter(group => group.length >= 3),
)

const validMouseup$$ = fromEvent<MouseEvent>(window, 'mouseup', true).pipe(
  filter(({ target }) => (
    config.active &&
    window.name !== 'saladict-frame' &&
    (!target || typeof target['className'] !== 'string' || !target['className'].startsWith('saladict-'))
  )),
  // if user click on a selected text,
  // getSelection would reture the text before the highlight disappears
  // delay to wait for selection get cleared
  observeOn(async),
  share(),
)

const clickPeriodCount$ = merge(
  mapTo(true)(validMouseup$$),
  switchMap(() => timer(config.doubleClickDelay).pipe(take(1), mapTo(false)))(validMouseup$$)
).pipe(
  scan((sum: number, flag: boolean) => flag ? sum + 1 : 0, 0)
)

createAppConfigStream().subscribe(newConfig => config = newConfig)

isCtrlPressed$.subscribe(flag => isCtrlPressed = flag)

clickPeriodCount$.subscribe(count => clickPeriodCount = count)

tripleCtrlPressed$.subscribe(() => {
  message.self.send({ type: MsgType.TripleCtrl })
})

validMouseup$$.subscribe(({ clientX, clientY }) => {
  const text = selection.getSelectionText()
  if (
    text && (
      (config.language.english && isContainEnglish(text) && !isContainChinese(text)) ||
      (config.language.chinese && isContainChinese(text))
    )
  ) {
    sendMessage(
      clientX,
      clientY,
      clickPeriodCount >= 2,
      isCtrlPressed,
      {
        text: selection.getSelectionText(),
        context: selection.getSelectionSentence(),
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
    message.self.send({
      type: MsgType.Selection,
      selectionInfo,
      mouseX: clientX,
      mouseY: clientY,
      dbClick,
      ctrlKey: isCtrlPressed,
    } as MsgSelection)
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
  message.self.send({
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
    }
  } as MsgSelection)
}

/**
 * Is ctrl/command button pressed
 */
function isCtrlKey (evt: KeyboardEvent): boolean {
  // ctrl & command(mac)
  if (evt.keyCode) {
    if (evt.keyCode === 17 || evt.keyCode === 91 || evt.keyCode === 93) {
      return true
    }
    return false
  }

  if (evt.key) {
    if (evt.key === 'Control' || evt.key === 'Meta') {
      return true
    }
  }

  return false
}
