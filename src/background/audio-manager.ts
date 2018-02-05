/**
 * To make sure only one audio plays at a time
 */

import { timeout } from '@/_helpers/promise-more'

declare global {
  interface Window {
    __audio_manager__?: HTMLAudioElement
  }
}

function noop () {/* empty */}

export function load (src: string): HTMLAudioElement {
  if (window.__audio_manager__) {
    window.__audio_manager__.pause()
    window.__audio_manager__.currentTime = 0
    window.__audio_manager__.src = ''
  }
  window.__audio_manager__ = new Audio(src)
  return window.__audio_manager__
}

export function play (src?: string): Promise<void> {
  // ignore interruption error
  let p: Promise<void>
  if (src) {
    p = load(src).play()
  } else if (window.__audio_manager__) {
    p = window.__audio_manager__.play()
  } else {
    return Promise.resolve()
  }

  const onEnd = new Promise(resolve => {
    const audio = window.__audio_manager__ as HTMLAudioElement
    function handler () {
      audio.removeEventListener('ended', handler)
      resolve()
    }
    audio.addEventListener('ended', handler)
  })

  return p.then(() => timeout(onEnd, 4000))
    .catch(noop)
}

export function addListener<K extends keyof HTMLMediaElementEventMap> (
  type: K,
  listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void
export function addListener (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void
export function addListener (type, listener, options): void {
  if (window.__audio_manager__) {
    if (options) {
      window.__audio_manager__.addEventListener(type, listener, options)
    } else {
      window.__audio_manager__.addEventListener(type, listener)
    }
  }
}

export default {
  load,
  play,
  addListener,
}
