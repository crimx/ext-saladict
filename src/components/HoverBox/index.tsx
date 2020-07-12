import React, { FC, useContext, useRef, useState } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  identity
} from 'observable-hooks'
import { merge } from 'rxjs'
import {
  hover,
  hoverWithDelay,
  focusBlur,
  mapToTrue
} from '@/_helpers/observables'
import { FloatBox, FloatBoxItem } from '../FloatBox'
import { createPortal } from 'react-dom'

export type HoverBoxItem = FloatBoxItem

/**
 * Accept a optional root element via Context which
 * will be the parent element of the float boxes.
 * This is for bypassing z-index restriction, making sure
 * the float boxes is always on top of other elements.
 */
export const HoverBoxContext = React.createContext<
  React.RefObject<HTMLElement | null>
>({ current: null })

export interface HoverBoxProps {
  Button: React.ComponentType<React.ComponentProps<'button'>>
  items: HoverBoxItem[]
  /** Compact float box */
  compact?: boolean
  /** box top offset */
  top?: number
  /** box left offset */
  left?: number
  onSelect?: (key: string, value: string) => void
  /** return false to prevent showing float box */
  onBtnClick?: () => boolean
  onHeightChanged?: (height: number) => void
}

/**
 * A button and a FloatBox that shows when hovering.
 */
export const HoverBox: FC<HoverBoxProps> = props => {
  const portalRootRef = useContext(HoverBoxContext)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [onHoverBtn, onHoverBtn$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hoverWithDelay)

  const [onBtnClick, onBtnClick$] = useObservableCallback<boolean, void>(
    mapToTrue
  )

  const [onHoverBox, onHoverBox$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hover)

  const [onFocusBlur, focusBlur$] = useObservableCallback(focusBlur)

  const [showBox, showBox$] = useObservableCallback<boolean>(identity)

  const isOnBtn = useObservableState(
    useObservable(() => merge(onHoverBtn$, onBtnClick$)),
    false
  )

  const isOnBox = useObservableState(
    useObservable(() => merge(onHoverBox$, focusBlur$, showBox$)),
    false
  )

  const isShowBox = isOnBtn || isOnBox

  const [floatBoxStyle, setFloatBoxStyle] = useState<React.CSSProperties>(() =>
    props.left == null
      ? {
          top: props.top == null ? 40 : props.top,
          left: '50%',
          transform: 'translateX(-50%)'
        }
      : {
          top: props.top == null ? 40 : props.top,
          left: props.left
        }
  )

  return (
    <div className="hoverBox-Container" ref={containerRef}>
      <props.Button
        onKeyDown={e => {
          switch (e.key) {
            case 'ArrowDown':
              // Show float box or jump focus to the first item
              e.preventDefault()
              e.stopPropagation()
              if (isShowBox) {
                if (boxRef.current) {
                  const firstBtn = boxRef.current.firstElementChild
                  if (firstBtn) {
                    ;(firstBtn as HTMLButtonElement | HTMLSelectElement).focus()
                  }
                }
              } else {
                showBox(true)
              }
              break
            case 'Tab':
              // Jump focus to the first item
              if (!e.shiftKey && isShowBox && boxRef.current) {
                e.preventDefault()
                e.stopPropagation()
                const firstBtn = boxRef.current.firstElementChild
                if (firstBtn) {
                  ;(firstBtn as HTMLButtonElement | HTMLSelectElement).focus()
                }
              }
              break
          }
        }}
        onMouseOver={onHoverBtn}
        onMouseOut={onHoverBtn}
        onClick={() => {
          if (!props.onBtnClick || props.onBtnClick() !== false) {
            onBtnClick()
          }
        }}
      />
      <CSSTransition
        classNames="csst-hoverBox"
        in={isShowBox}
        timeout={100}
        mountOnEnter
        unmountOnExit
        onEnter={() => {
          if (portalRootRef.current && containerRef.current) {
            const portalRootRect = portalRootRef.current.getBoundingClientRect()
            const containerRect = containerRef.current.getBoundingClientRect()
            setFloatBoxStyle({
              top:
                containerRect.y -
                portalRootRect.y +
                (props.top == null ? 40 : props.top),
              left:
                containerRect.x -
                portalRootRect.x +
                (props.left == null
                  ? -Math.floor(containerRect.width / 2)
                  : props.left)
            })
          }
        }}
        onExited={() => props.onHeightChanged && props.onHeightChanged(0)}
      >
        {() => {
          const floatBox = (
            <div className="hoverBox-FloatBox" style={floatBoxStyle}>
              <FloatBox
                ref={boxRef}
                compact={props.compact}
                list={props.items}
                onFocus={onFocusBlur}
                onBlur={onFocusBlur}
                onMouseOver={onHoverBox}
                onMouseOut={onHoverBox}
                onArrowUpFirst={container =>
                  (container.lastElementChild as HTMLButtonElement).focus()
                }
                onArrowDownLast={container =>
                  (container.firstElementChild as HTMLButtonElement).focus()
                }
                onSelect={props.onSelect}
                onHeightChanged={props.onHeightChanged}
                onClose={() => showBox(false)}
              />
            </div>
          )

          return portalRootRef.current && containerRef.current
            ? createPortal(floatBox, portalRootRef.current)
            : floatBox
        }}
      </CSSTransition>
    </div>
  )
}
