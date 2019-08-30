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
  const heightRef = useRef(50)

  const [x, setX] = useState(props.x)
  const [y, setY] = useState(props.y)

  useEffect(() => {
    setX(reconcileX(props.width, props.x))
  }, [props.x])

  useEffect(() => {
    setY(reconcileY(heightRef.current, props.y))
  }, [props.y])

  useUpdateEffect(() => {
    setX(x => reconcileX(props.width, x))
    setY(y => reconcileY(heightRef.current, y))
  }, [props.width])

  const updateHeightRef = useRef((width: number, height: number) => {
    heightRef.current = height
    setX(x => reconcileX(props.width, x))
    setY(y => reconcileY(heightRef.current, y))
  })

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
        '--panel-max-height': props.maxHeight + 'px'
      }}
    >
      <ReactResizeDetector
        handleHeight
        refreshMode="debounce"
        refreshRate={100}
        onResize={updateHeightRef.current}
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

function reconcileX(width: number, x: number): number {
  const winWidth = window.innerWidth

  // also counted scrollbar width
  if (x + width + 25 > winWidth) {
    x = winWidth - 25 - width
  }

  if (x < 10) {
    x = 10
  }

  return x
}

function reconcileY(height: number, y: number): number {
  const winHeight = window.innerHeight

  if (y + height + 15 > winHeight) {
    y = winHeight - 15 - height
  }

  if (y < 15) {
    y = 15
  }

  return y
}
