import React, { FC, ReactNode, useEffect, useRef } from 'react'
import { SALADICT_EXTERNAL, SALADICT_PANEL } from '@/_helpers/saladict'
import ReactResizeDetector from 'react-resize-detector'
import {
  useObservableCallback,
  useObservable,
  pluckFirst,
  useObservableState
} from 'observable-hooks'
import { startWith, map, switchMap } from 'rxjs/operators'
import { Observable, combineLatest, merge, empty, fromEvent } from 'rxjs'

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
  const [updateHeight, height$] = useObservableCallback<
    number,
    number,
    [number, number]
  >(height$ => height$.pipe(startWith(50)), args => args[1])

  const propsY$ = useObservable(pluckFirst, [props.y])

  const reconciledX$ = useObservable(reconcileX, [props.width, props.x])
  const reconciledY$ = useObservable(() =>
    reconcileY(combineLatest(height$, propsY$))
  )
  const reconciledCoord$ = useObservable(() =>
    combineLatest(reconciledX$, reconciledY$)
  )

  const dragStartCoordRef = useRef<{
    panelX: number
    panelY: number
    mouseX: number
    mouseY: number
  }>()

  const dragCoord$ = useObservable(
    inputs$ =>
      inputs$.pipe(
        switchMap(([dragStartCoord]) => {
          if (!dragStartCoord) return empty()
          return merge(
            fromEvent<MouseEvent>(window, 'mousemove').pipe(
              map(event => {
                event.preventDefault()
                event.stopPropagation()
                return { x: event.clientX, y: event.clientY }
              })
            ),
            fromEvent<TouchEvent>(window, 'touchmove').pipe(
              map(event => {
                event.preventDefault()
                event.stopPropagation()
                const touch = event.touches[0]
                return { x: touch.clientX, y: touch.clientY }
              })
            )
          ).pipe(
            map(coord => {
              const startCoord = dragStartCoordRef.current
              return startCoord
                ? [
                    coord.x - startCoord.mouseX + startCoord.panelX,
                    coord.y - startCoord.mouseY + startCoord.panelY
                  ]
                : [0, 0]
            })
          )
        })
      ),
    [props.dragStartCoord]
  )

  useEffect(() => {
    if (props.dragStartCoord) {
      dragStartCoordRef.current = {
        panelX: x,
        panelY: y,
        mouseX: props.dragStartCoord.x,
        mouseY: props.dragStartCoord.y
      }

      const mouseoutHandler = (e: MouseEvent) => {
        if (!e.relatedTarget && !e.toElement) {
          props.onDragEnd()
        }
      }

      const dragEndHandler = props.onDragEnd

      window.addEventListener('mouseout', mouseoutHandler)
      window.addEventListener('mouseup', dragEndHandler)
      window.addEventListener('touchend', dragEndHandler)

      return () => {
        window.removeEventListener('mouseout', mouseoutHandler)
        window.removeEventListener('mouseup', dragEndHandler)
        window.removeEventListener('touchend', dragEndHandler)
      }
    }
  }, [props.dragStartCoord, props.onDragEnd])

  const coord$ = useObservable(() => merge(reconciledCoord$, dragCoord$))

  const [x, y] = useObservableState(coord$)!

  return (
    <div
      className={
        `dictPanel-Root ${SALADICT_EXTERNAL} ${SALADICT_PANEL}` +
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
        onResize={updateHeight}
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

function reconcileX(inputs$: Observable<[number, number]>): Observable<number> {
  return inputs$.pipe(
    map(([width, x]) => {
      const winWidth = window.innerWidth

      // also counted scrollbar width
      if (x + width + 25 > winWidth) {
        x = winWidth - 25 - width
      }

      if (x < 10) {
        x = 10
      }

      return x
    })
  )
}

function reconcileY(inputs$: Observable<[number, number]>): Observable<number> {
  return inputs$.pipe(
    map(([height, y]) => {
      const winHeight = window.innerHeight

      if (y + height + 15 > winHeight) {
        y = winHeight - 15 - height
      }

      if (y < 15) {
        y = 15
      }

      return y
    })
  )
}
