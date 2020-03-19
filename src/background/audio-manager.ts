import { timeout } from '@/_helpers/promise-more'

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

  reset() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio.src = ''
      this.audio.onended = null
    }
  }

  load(src: string): HTMLAudioElement {
    this.reset()
    return (this.audio = new Audio(src))
  }

  async play(src?: string): Promise<void> {
    if (!src) {
      this.reset()
      return
    }

    const audio = this.load(src)

    const onEnd = new Promise(resolve => {
      audio.onended = resolve
    })

    await audio
      .play()
      .then(() => timeout(onEnd, 4000))
      .catch(() => {})
  }
}
