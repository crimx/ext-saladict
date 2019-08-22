import React, { FC, ReactNode, useState, useEffect } from 'react'
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
}

export const DictPanel: FC<DictPanelProps> = props => {
  const [height, setHeight] = useState(40)

  const [cord, setCord] = useState(() =>
    reconcile(props.width, height, props.x, props.y)
  )

  useEffect(() => {
    setCord(reconcile(props.width, height, props.x, props.y))
  }, [props.x, props.y])

  useEffect(() => {
    setCord(reconcile(props.width, height, cord.x, cord.y))
  }, [props.width, height])

  return (
    <div
      className={`dictPanel-Root${props.withAnimation ? ' isAnimate' : ''}`}
      style={{
        left: cord.x,
        top: cord.y,
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
      <ResizeReporter onHeightChanged={setHeight} reportInit debounce={50} />
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div className="dictPanel-Body">
        {props.mtaBox}
        {props.dictList}
      </div>
      {props.waveformBox}
    </div>
  )
}

function reconcile(
  width: number,
  height: number,
  x: number,
  y: number
): { x: number; y: number } {
  const winWidth = window.innerWidth
  const winHeight = window.innerHeight

  if (x + width + 10 > winWidth) {
    x = winWidth - 10 - width
  }

  if (x < 10) {
    x = 10
  }

  if (y + height + 10 > winHeight) {
    y = winHeight - 10 - height
  }

  if (y < 10) {
    y = 10
  }

  return { x, y }
}
