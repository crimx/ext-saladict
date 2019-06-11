import React, { ComponentClass, SFC } from 'react'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgAudioPlay } from '@/typings/message'

export function getStaticSpeakerHTML (src?: string | null): string {
  return src
    ? `<a href="${src}" target="_blank" class="saladict-StaticSpeaker">🔊</a>`
    : ''
}

/**
 * Use this HOC when speakers are rendered from HTML string.
 * Speakers should have class name 'saladict-StaticSpeaker'.
 */
export function withStaticSpeaker<P> (
  WrapComponent: ComponentClass<P> | SFC<P> | string,
) {
  return class StaticSpeaker extends React.PureComponent<P> {
    // _audioDelayTimeout: any

    static isAudioElement (evt: React.MouseEvent<HTMLDivElement>): boolean {
      return Boolean(
        evt.target &&
        evt.target['tagName'] === 'A' &&
        evt.target['classList'] &&
        evt.target['classList'].contains('saladict-StaticSpeaker')
      )
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
      if (StaticSpeaker.isAudioElement(evt) && evt.target['href']) {
        // clearTimeout(this._audioDelayTimeout)
        evt.preventDefault()
        evt.stopPropagation()
        message.send<MsgAudioPlay>({
          type: MsgType.PlayAudio,
          src: evt.target['href']
        })
      }
    }

    // playAudio = (target: HTMLElement) => {
    //   const src = target.dataset.srcMp3
    //   if (src) {
    //     message.self.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
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
