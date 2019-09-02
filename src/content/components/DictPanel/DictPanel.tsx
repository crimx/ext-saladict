import React, { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import ReactResizeDetector from 'react-resize-detector'
import { SALADICT_PANEL } from '@/_helpers/saladict'

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

  dragStartCoord: null | { x: number; y: number }
  onDragEnd: () => void
}

export const DictPanel: FC<DictPanelProps> = props => {
  const heightRef = useRef(50)

  const [x, setX] = useState(() => reconcileX(props.width, props.x))
  const [y, setY] = useState(() => reconcileY(heightRef.current, props.y))

  useUpdateEffect(() => {
    setX(reconcileX(props.width, props.x))
  }, [props.x])

  useUpdateEffect(() => {
    setY(reconcileY(heightRef.current, props.y))
  }, [props.y])

  useUpdateEffect(() => {
    setX(x => reconcileX(props.width, x))
  }, [props.width])

  const setHeightRef = useRef((width: number, height: number) => {
    heightRef.current = height
    setY(y => reconcileY(heightRef.current, y))
  })

  useEffect(() => {
    if (props.dragStartCoord) {
      const startPanelX = x
      const startPanelY = y
      const startMouseX = props.dragStartCoord.x
      const startMouseY = props.dragStartCoord.y

      const mousemoveHandler = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setX(e.clientX - startMouseX + startPanelX)
        setY(e.clientY - startMouseY + startPanelY)
      }

      const touchmoveHandler = (e: TouchEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setX(e.changedTouches[0].clientX - startMouseX + startPanelX)
        setY(e.changedTouches[0].clientY - startMouseY + startPanelY)
      }

      const mouseoutHandler = (e: MouseEvent) => {
        if (!e.relatedTarget && !e.toElement) {
          props.onDragEnd()
        }
      }

      const dragEndHandler = props.onDragEnd

      window.addEventListener('mousemove', mousemoveHandler)
      window.addEventListener('touchmove', touchmoveHandler)
      window.addEventListener('mouseout', mouseoutHandler)
      window.addEventListener('mouseup', dragEndHandler)
      window.addEventListener('touchend', dragEndHandler)

      return () => {
        window.removeEventListener('mousemove', mousemoveHandler)
        window.removeEventListener('touchmove', touchmoveHandler)
        window.removeEventListener('mouseout', mouseoutHandler)
        window.removeEventListener('mouseup', dragEndHandler)
        window.removeEventListener('touchend', dragEndHandler)
      }
    }
  }, [props.dragStartCoord, props.onDragEnd])

  return (
    <div
      className={
        `dictPanel-Root ${SALADICT_PANEL}` +
        (props.withAnimation ? ' isAnimate' : '') +
        (props.dragStartCoord ? ' isDragging' : '')
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
        onResize={setHeightRef.current}
      />
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div className="dictPanel-Body">
        {props.mtaBox}
        {props.dictList}
      </div>
      {props.waveformBox}
      {props.dragStartCoord && <div className="dictPanel-DragMask" />}
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
