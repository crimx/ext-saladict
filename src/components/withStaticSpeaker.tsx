import React, { ComponentClass, SFC } from 'react'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgAudioPlay } from '@/typings/message'

/**
 * Use this HOC when speakers are rendered from HTML string.
 * Speakers should have class name 'saladict-StaticSpeaker'.
 */
export default function withStaticSpeaker<P> (
  WrapComponent: ComponentClass<P> | SFC<P> | string,
  className = 'saladict-StaticSpeaker'
) {
  return class StaticSpeaker extends React.PureComponent<P> {
    // _audioDelayTimeout: any

    static isAudioElement (evt: React.MouseEvent<HTMLDivElement>): boolean {
      const target = (evt.target as HTMLElement)
      const cls = target.classList
      return cls && cls.contains(className)
    }

    // handleDictMouseOver = (evt: React.MouseEvent<HTMLDivElement>) => {
    //   if (this.isAudioElement(evt)) {
    //     clearTimeout(this._audioDelayTimeout)
    //     // React resuses synthetic event object
    //     const target = evt.target as HTMLElement
    //     this._audioDelayTimeout =
    //       setTimeout(() => this.playAudio(target), 400)
    //   }
    // }

    // handleDictMouseOut = (evt: React.MouseEvent<HTMLDivElement>) => {
    //   if (this.isAudioElement(evt)) {
    //     clearTimeout(this._audioDelayTimeout)
    //   }
    // }

    handleDictClick = (evt: React.MouseEvent<HTMLDivElement>) => {
      if (StaticSpeaker.isAudioElement(evt)) {
        // clearTimeout(this._audioDelayTimeout)
        const src = evt.target && evt.target['dataset'] && evt.target['dataset'].srcMp3
        if (src) {
          message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
        }
      }
    }

    // playAudio = (target: HTMLElement) => {
    //   const src = target.dataset.srcMp3
    //   if (src) {
    //     message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
    //   }
    // }

    render () {
      return (
        <div
          onClick={this.handleDictClick}
          // onMouseOver={this.handleDictMouseOver}
          // onMouseOut={this.handleDictMouseOut}
        >
          <WrapComponent {...this.props} />
        </div>
      )
    }
  }
}
