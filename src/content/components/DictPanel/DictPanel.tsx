import React, { FC, ReactNode, useState, useEffect, useRef } from 'react'
import { useUpdateEffect } from 'react-use'
import { SALADICT_EXTERNAL, SALADICT_PANEL } from '@/_helpers/saladict'
import ReactResizeDetector from 'react-resize-detector'

export interface DictPanelProps {
  x: number
  y: number

  width: number
  maxHeight: number
  minHeight: number

  withAnimation: boolean

  menuBar: ReactNode
  mtaBox: ReactNode
  dictList: ReactNode
  waveformBox: ReactNode
}

export const DictPanel: FC<DictPanelProps> = props => {
  const [height, _setHeight] = useState(50)
  const updateHeightRef = useRef((width: number, height: number) => {
    _setHeight(height)
  })

  const [x, setX] = useState(props.x)
  const [y, setY] = useState(props.y)

  useEffect(() => {
    setX(reconcileX(props.width, props.x))
  }, [props.x])

  useEffect(() => {
    setY(reconcileY(height, props.y))
  }, [props.y])

  useUpdateEffect(() => {
    setX(x => reconcileX(props.width, x))
    setY(y => reconcileY(height, y))
  }, [props.width, height])

  return (
    <div
      className={
        `dictPanel-Root ${SALADICT_EXTERNAL} ${SALADICT_PANEL}` +
        (props.withAnimation ? ' isAnimate' : '')
      }
      style={{
        left: x,
        top: y,
        width: props.width,
        maxHeight: props.maxHeight,
        minHeight: props.minHeight,
        backgroundColor: '#fff',
        color: '#333',
        '--panel-background-color': '#fff',
        '--panel-color': '#333',
        '--panel-width': props.width + 'px',
        '--panel-height': height + 'px'
      }}
    >
      <ReactResizeDetector handleHeight onResize={updateHeightRef.current} />
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div className="dictPanel-Body">
        {props.mtaBox}
        {props.dictList}
      </div>
      {props.waveformBox}
    </div>
  )
}

function reconcileX(width: number, x: number): number {
  const winWidth = window.innerWidth

  if (x + width + 10 > winWidth) {
    x = winWidth - 10 - width
  }

  if (x < 10) {
    x = 10
  }

  return x
}

function reconcileY(height: number, y: number): number {
  const winHeight = window.innerHeight

  if (y + height + 10 > winHeight) {
    y = winHeight - 10 - height
  }

  if (y < 10) {
    y = 10
  }

  return y
}
