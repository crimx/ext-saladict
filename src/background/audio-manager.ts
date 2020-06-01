import { timer } from '@/_helpers/promise-more'

/**
 * To make sure only one audio plays at a time
 */
export class AudioManager {
  private static instance: AudioManager

  static getInstance() {
    return AudioManager.instance || (AudioManager.instance = new AudioManager())
  }

  // singleton
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  private audio?: HTMLAudioElement

  currentSrc?: string

  reset() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio.src = ''
      this.audio.onended = null
    }
    this.currentSrc = ''
  }

  load(src: string): HTMLAudioElement {
    this.reset()
    this.currentSrc = src
    return (this.audio = new Audio(src))
  }

  async play(src?: string): Promise<void> {
    if (!src || src === this.currentSrc) {
      this.reset()
      return
    }

    const audio = this.load(src)

    const onEnd = Promise.race([
      new Promise(resolve => {
        audio.onended = resolve
      }),
      timer(20000)
    ])

    await audio.play()
    await onEnd

    this.currentSrc = ''
  }
}
