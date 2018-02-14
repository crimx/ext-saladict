import { appConfigFactory, AppConfig } from 'src/app-config'
import { message, storage } from '@/_helpers/browser-api'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { createAppConfigStream } from '@/_helpers/config-manager'
import * as selection from '@/_helpers/selection'
import { MsgSALADICT_SELECTION, MsgSELECTION } from '@/typings/message'

import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { map, filter, withLatestFrom, buffer, debounceTime, observeOn } from 'rxjs/operators'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { merge } from 'rxjs/observable/merge'
import { async } from 'rxjs/scheduler/async'

message.addListener('__PRELOAD_SELECTION__', (data, sender, sendResponse) => {
  sendResponse(selection.getSelectionInfo())
})

window.addEventListener('message', ({ data, source }: { data: MsgSALADICT_SELECTION, source: Window }) => {
  if (data.type !== 'SALADICT_SELECTION') { return }

  // get the souce iframe
  const iframe = Array.from(document.querySelectorAll('iframe'))
    .find(({ contentWindow }) => contentWindow === source)
  if (!iframe) { return }

  const { selectionInfo, mouseX, mouseY, ctrlKey } = data
  const { left, top } = iframe.getBoundingClientRect()

  sendMessage(
    mouseX + left,
    mouseY + top,
    ctrlKey,
    selectionInfo
  )
})

const appConfig$: Observable<AppConfig> = createAppConfigStream()

const configLanguage$: Observable<AppConfig['language']> = appConfig$.pipe(
  map(config => config.language),
)

const isCtrlPressed$: Observable<boolean> = merge(
  of(false),
  fromEvent(window, 'keydown', true, e => isCtrlKey(e)),
  fromEvent(window, 'keyup', true, e => false),
  fromEvent(window, 'blur', true, e => false),
)

const ctrlPressed$ = isCtrlPressed$.pipe(
  withLatestFrom(appConfig$, (isCtrlPressed, config) => config.active && isCtrlPressed),
  filter(isCtrlPressed => isCtrlPressed),
)

const tripleCtrlPressed$ = ctrlPressed$.pipe(
  buffer(ctrlPressed$.pipe(debounceTime(500))),
  map(group => group.length),
  filter(x => x >= 3),
)

const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup', true).pipe(
  withLatestFrom(appConfig$, isCtrlPressed$),
  filter(([ e, config ]) => {
    if (!config.active || window.name === 'saladict-frame') { return false }
    if ((e.target as Element).className && ((e.target as Element).className.startsWith('saladict-'))) {
      return false
    }
    return true
  }),
  // if user click on a selected text,
  // getSelection would reture the text before the highlight disappears
  // delay to wait for selection get cleared
  observeOn(async),
)

tripleCtrlPressed$.subscribe(() => {
  message.self.send({ type: 'TRIPLE_CTRL' })
})

mouseup$.subscribe(([ evt, config, ctrlKey ]) => {
  const text = selection.getSelectionText()
  if (
    text && (
      (config.language.english && isContainEnglish(text) && !isContainChinese(text)) ||
      (config.language.chinese && isContainChinese(text))
    )
  ) {
    sendMessage(
      evt.clientX,
      evt.clientY,
      ctrlKey,
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
  isCtrlPressed: boolean,
  selectionInfo: selection.SelectionInfo
) {
  if (window.parent === window) {
    // top
    message.self.send({
      type: 'SELECTION',
      selectionInfo,
      mouseX: clientX,
      mouseY: clientY,
      ctrlKey: isCtrlPressed,
    } as MsgSELECTION)
  } else {
    // post to upper frames/window
    window.parent.postMessage({
      type: 'SALADICT_SELECTION',
      selectionInfo,
      mouseX: clientX,
      mouseY: clientY,
      ctrlKey: isCtrlPressed,
    } as MsgSALADICT_SELECTION, '*')
  }
}

function sendEmptyMessage () {
  // empty message
  message.self.send({
    type: 'SELECTION',
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
  } as MsgSELECTION)
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
