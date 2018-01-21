/**
 * To make sure only one audio plays at a time
 */

declare global {
  interface Window {
    __audio_manager__?: HTMLAudioElement
  }
}

export function load (src: string): HTMLAudioElement {
  if (window.__audio_manager__) {
    window.__audio_manager__.pause()
    window.__audio_manager__.currentTime = 0
    window.__audio_manager__.src = ''
  }
  window.__audio_manager__ = new Audio(src)
  return window.__audio_manager__
}

export function play (src: string): Promise<void> {
  // ignore interruption error
  return load(src).play().catch(() => {})
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
