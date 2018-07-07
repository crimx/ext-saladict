import React from 'react'
import { GoogleDictResult } from './engine'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgAudioPlay } from '@/typings/message'

export default class DictGoogleDict extends React.PureComponent<{ result: GoogleDictResult }> {
  _audioDelayTimeout: any

  isAudioElement (evt: React.MouseEvent<HTMLDivElement>): boolean {
    const target = (evt.target as HTMLElement)
    const cls = target.classList
    return cls && cls.contains('dictGoogleDict-Speaker')
  }

  handleDictMouseOver = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (this.isAudioElement(evt)) {
      clearTimeout(this._audioDelayTimeout)
      // React resuses synthetic event object
      const target = evt.target as HTMLElement
      this._audioDelayTimeout =
        setTimeout(() => this.playAudio(target), 400)
    }
  }

  handleDictMouseOut = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (this.isAudioElement(evt)) {
      clearTimeout(this._audioDelayTimeout)
    }
  }

  handleDictClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (this.isAudioElement(evt)) {
      clearTimeout(this._audioDelayTimeout)
      const target = evt.target as HTMLElement
      target.blur()
      this.playAudio(target)
    }
  }

  playAudio = (target: HTMLElement) => {
    const src = target.dataset.srcMp3
    if (src) {
      message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
    }
  }

  render () {
    return (
      <div
        className='dictGoogleDict-Entry'
        onClick={this.handleDictClick}
        onMouseOver={this.handleDictMouseOver}
        onMouseOut={this.handleDictMouseOut}
        dangerouslySetInnerHTML={{ __html: this.props.result.entry }}
      />
    )
  }
}
