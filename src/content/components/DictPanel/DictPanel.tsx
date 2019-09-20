import React, { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { getScrollbarWidth } from '@/_helpers/scrollbar-width'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelProps {
  /** Update position command from uptream */
  coord: {
    x: number
    y: number
  }
  /** Take or restore position snaphot when this value changes */
  takeCoordSnapshot: boolean

  width: number
  height: number
  maxHeight: number

  withAnimation: boolean
  darkMode: boolean
  colors: React.CSSProperties

  menuBar: ReactNode
  mtaBox: ReactNode
  dictList: ReactNode
  waveformBox: ReactNode

  dragStartCoord: null | { x: number; y: number }
  onDragEnd: () => void
}

export const DictPanel: FC<DictPanelProps> = props => {
  const [x, setX] = useState(() => reconcileX(props.width, props.coord.x))
  const [y, setY] = useState(() => reconcileY(props.height, props.coord.y))

  const coordSnapshotRef = useRef<{ x: number; y: number }>()

  useUpdateEffect(() => {
    if (props.takeCoordSnapshot) {
      coordSnapshotRef.current = { x, y }
    } else {
      if (coordSnapshotRef.current) {
        setX(reconcileX(props.width, coordSnapshotRef.current.x))
        setY(reconcileY(props.height, coordSnapshotRef.current.y))
      }
    }
  }, [props.takeCoordSnapshot])

  useUpdateEffect(() => {
    setX(reconcileX(props.width, props.coord.x))
    setY(reconcileY(props.height, props.coord.y))
  }, [props.coord])

  useUpdateEffect(() => {
    setX(x => reconcileX(props.width, x))
    setY(y => reconcileY(props.height, y))
  }, [props.width, props.height])

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
        if (!e.relatedTarget) {
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
        ...props.colors,
        left: x,
        top: y,
        width: props.width,
        height: props.height,
        '--panel-width': props.width + 'px',
        '--panel-max-height': props.maxHeight + 'px'
      }}
    >
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div
        className={`dictPanel-Body${
          getScrollbarWidth() > 0 ? ' fancy-scrollbar' : ''
        }`}
      >
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
