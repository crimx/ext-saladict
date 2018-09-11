/**
 * To make sure only one audio plays at a time
 */

import { timeout } from '@/_helpers/promise-more'

declare global {
  interface Window {
    /** Singleton audio playing */
    __audio_manager__?: HTMLAudioElement
  }
}

function noop () {/* empty */}

export function reset () {
  if (window.__audio_manager__) {
    window.__audio_manager__.pause()
    window.__audio_manager__.currentTime = 0
    window.__audio_manager__.src = ''
    window.__audio_manager__.onended = null
  }
}

export function load (src: string): HTMLAudioElement {
  reset()
  window.__audio_manager__ = new Audio(src)
  return window.__audio_manager__
}

export function play (src?: string): Promise<any> {
  if (!src) {
    reset()
    return Promise.resolve()
  }

  const audio = load(src)

  const onEnd = new Promise(resolve => {
    audio.onended = resolve
  })

  return audio.play().then(() => timeout(onEnd, 4000))
    .catch(noop)
}
