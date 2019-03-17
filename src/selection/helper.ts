import { AppConfig } from '@/app-config'
import { createConfigStream } from '@/_helpers/config-manager'
import { message } from '@/_helpers/browser-api'
import { getDefaultSelectionInfo, SelectionInfo } from '@/_helpers/selection'
import { MsgType, PostMsgType, PostMsgSelection, MsgSelection } from '@/typings/message'

import { Observable } from 'rxjs/Observable'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { merge } from 'rxjs/observable/merge'
import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operators/map'
import { mapTo } from 'rxjs/operators/mapTo'
import { share } from 'rxjs/operators/share'
import { filter } from 'rxjs/operators/filter'
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged'

const isMac = /mac/i.test(navigator.platform)

export const config$$ = share<AppConfig>()(createConfigStream())

export function sendMessage (
  msg: {
    selectionInfo: SelectionInfo
    mouseX: number
    mouseY: number
    self: boolean
    dbClick?: boolean
    shiftKey?: boolean
    ctrlKey?: boolean
    metaKey?: boolean
    instant?: boolean
  }
) {
  if (window.parent === window) {
    // top
    if (process.env.NODE_ENV === 'development') {
      console.log('New selection', msg)
    }

    message.self.send<MsgSelection>({
      dbClick: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      instant: false,
      ...msg,
      force: false,
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

export function sendEmptyMessage (isDictPanel: boolean) {
  // empty message
  const msg: MsgSelection = {
    type: MsgType.Selection,
    selectionInfo: getDefaultSelectionInfo(),
    self: isDictPanel,
    mouseX: 0,
    mouseY: 0,
    dbClick: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    instant: false,
    force: false,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('New selection', msg)
  }

  message.self.send(msg)
}

/**
 * Is quick search key pressed(command on mac, ctrl on others)
 */
export function isQSKey (evt: KeyboardEvent): boolean {
  return isMac ? evt.key === 'Meta' : evt.key === 'Control'
}

/**
 * Is esc button pressed
 */
export function isEscapeKey (evt: KeyboardEvent): boolean {
  return evt.key === 'Escape'
}

export function isKeyPressed (keySelectior: (e: KeyboardEvent) => boolean): Observable<true> {
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

export function isTypeField (event: MouseEvent | TouchEvent | null): boolean {
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
export function isInPanelOnInternalPage (
  event: MouseEvent | TouchEvent | null
): boolean {
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

export function isBlacklisted (config: AppConfig): boolean {
  const url = window.pageURL || document.URL || ''
  if (!url) { return false }
  return (
    config.blacklist.some(([r]) => new RegExp(r).test(url)) &&
    config.whitelist.every(([r]) => !new RegExp(r).test(url))
  )
}
