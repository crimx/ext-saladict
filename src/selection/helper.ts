import { AppConfig } from '@/app-config'
import { Observable, fromEvent, merge, of } from 'rxjs'
import { map, mapTo, filter, distinctUntilChanged } from 'rxjs/operators'

const isMac = /mac/i.test(navigator.platform)

/**
 * Is quick search key pressed(command on mac, ctrl on others)
 */
export function isQSKey(evt: KeyboardEvent): boolean {
  return isMac ? evt.key === 'Meta' : evt.key === 'Control'
}

/**
 * Is esc button pressed
 */
export function isEscapeKey(evt: KeyboardEvent): boolean {
  return evt.key === 'Escape'
}

export function isKeyPressed(
  keySelectior: (e: KeyboardEvent) => boolean
): Observable<true> {
  return merge(
    map(keySelectior)(
      fromEvent<KeyboardEvent>(window, 'keydown', { capture: true })
    ),
    mapTo(false)(fromEvent(window, 'keyup', { capture: true })),
    mapTo(false)(fromEvent(window, 'blur', { capture: true })),
    of(false)
  ).pipe(
    distinctUntilChanged(), // ignore long press
    filter((x): x is true => x)
  )
}

// common editors
const editorTester = /CodeMirror|ace_editor|monaco-editor/

export function isTypeField(event: MouseEvent | TouchEvent | null): boolean {
  if (event && event.target) {
    const target = event.target as Element
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return true
    }

    // Popular code editors CodeMirror, ACE and Monaco
    for (let el: Element | null = target; el; el = el.parentElement) {
      // With CodeMirror the `pre.CodeMirror-line` somehow got detached when the event
      // triggerd. So el will never reach the root `.CodeMirror`.
      if (editorTester.test(el.className)) {
        return true
      }
    }
  }

  return false
}

export function isBlacklisted(config: AppConfig): boolean {
  const url = window.pageURL || document.URL || ''
  if (!url) {
    return false
  }
  return (
    config.blacklist.some(([r]) => new RegExp(r).test(url)) &&
    config.whitelist.every(([r]) => !new RegExp(r).test(url))
  )
}
