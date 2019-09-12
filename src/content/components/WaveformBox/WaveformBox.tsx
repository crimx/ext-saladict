import React, { useEffect, FC } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WaveformBoxProps {
  isExpand: boolean
  toggleExpand: () => void
  onHeightChanged: (height: number) => void
}

export const WaveformBox: FC<WaveformBoxProps> = props => {
  useEffect(() => {
    props.onHeightChanged((props.isExpand ? 165 : 0) + 12)
  }, [props.isExpand])

  return (
    <div
      className={`waveformBox ${SALADICT_EXTERNAL}${
        props.isExpand ? ' isExpand' : ''
      }`}
    >
      <button className="waveformBox-DrawerBtn" onClick={props.toggleExpand}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 59.414 59.414"
          xmlns="http://www.w3.org/2000/svg"
          className="waveformBox-DrawerBtn_Arrow"
        >
          <path d="M 58 45.269 L 29.707 16.975 L 1.414 45.27 L 0 43.855 L 29.707 14.145 L 59.414 43.855" />
        </svg>
      </button>
      <div className="waveformBox-FrameWrap">
        <CSSTransition
          timeout={400}
          in={props.isExpand}
          classNames="waveformBox-Frame"
          mountOnEnter
          unmountOnExit
        >
          {renderIframe}
        </CSSTransition>
      </div>
    </div>
  )
}

function renderIframe() {
  return (
    <iframe
      className="waveformBox-Frame"
      src={browser.runtime.getURL('/audio-control.html')}
      sandbox="allow-same-origin allow-scripts"
    />
  )
}
