/**
 * To make sure only one audio plays at a time
 */
export default class AudioManager {
  constructor () {
    this.audio = new Audio()
  }

  load (src) {
    this.audio.pause()
    this.audio.currentTime = 0
    this.audio.src = ''
    this.audio = new Audio(src)
  }

  play (src) {
    if (src) { this.load(src) }
    // ignore interruption error
    this.audio.play().catch(() => {})
  }

  listen (...args) {
    return this.audio.addEventListener(...args)
  }
}
