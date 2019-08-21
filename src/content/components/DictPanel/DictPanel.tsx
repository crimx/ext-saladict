import React, { FC, ReactNode, useState } from 'react'
import ResizeReporter from 'react-resize-reporter'

export interface DictPanelProps {
  x: number
  y: number
  width: number
  maxHeight: number

  withAnimation: boolean

  menuBar: ReactNode
  mtaBox: ReactNode
  dictList: ReactNode
  waveformBox: ReactNode

  onHeightChanged: (height: number) => void
}

export const DictPanel: FC<DictPanelProps> = props => {
  const [height, setHeight] = useState(40)

  return (
    <div
      className={`dictPanel-Root${props.withAnimation ? ' isAnimate' : ''}`}
      style={{
        left: props.x,
        top: props.y,
        width: props.width,
        maxHeight: props.maxHeight,
        backgroundColor: '#fff',
        color: '#333',
        '--panel-background-color': '#fff',
        '--panel-color': '#333',
        '--panel-width': props.width + 'px',
        '--panel-height': height + 'px'
      }}
    >
      <ResizeReporter
        onHeightChanged={height => {
          setHeight(height)
          props.onHeightChanged(height)
        }}
        reportInit
        debounce={10}
      />
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div className="dictPanel-Body">
        {props.mtaBox}
        {props.dictList}
      </div>
      {props.waveformBox}
    </div>
  )
}
