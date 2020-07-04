import React, { FC, useContext, useRef, useState } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import {
  useObservable,
  useObservableCallback,
  useObservableState
} from 'observable-hooks'
import { merge } from 'rxjs'
import {
  hover,
  hoverWithDelay,
  focusBlur,
  mapToTrue
} from '@/_helpers/observables'
import { FloatBox } from '../FloatBox'
import { createPortal } from 'react-dom'

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
  items: Array<{ key: string; content: React.ReactNode }>
  /** Compact float box */
  compact?: boolean
  top?: number
  left?: number
  onSelect?: (key: string) => void
  onBtnClick?: () => void
  onHeightChanged?: (height: number) => void
}

/**
 * A button and a FloatBox that shows when hovering.
 */
export const HoverBox: FC<HoverBoxProps> = props => {
  const portalRootRef = useContext(HoverBoxContext)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [onHoverBtn, onHoverBtn$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hoverWithDelay)

  const [onHoverBox, onHoverBox$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hover)

  const [onFocusBlur, focusBlur$] = useObservableCallback(focusBlur)

  const [showBox, showBox$] = useObservableCallback<boolean, void>(mapToTrue)

  const isOnBtn = useObservableState(onHoverBtn$, false)

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
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            e.stopPropagation()
            showBox()
          }
        }}
        onMouseOver={onHoverBtn}
        onMouseOut={onHoverBtn}
        onClick={props.onBtnClick}
      />
      <CSSTransition
        classNames="hoverBox"
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
