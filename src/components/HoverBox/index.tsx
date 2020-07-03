import React, { FC } from 'react'
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
import { isOptionsPage } from '@/_helpers/saladict'
import { FloatBox } from '../FloatBox'

export interface HoverBoxProps {
  Button: React.ComponentType<React.ComponentProps<'button'>>
  items: Array<{ key: string; content: React.ReactNode }>
  onSelect?: (key: string) => void
  onBtnClick?: () => void
  onHeightChanged?: (height: number) => void
}

/**
 * A button and a FloatBox that shows when hovering.
 */
export const HoverBox: FC<HoverBoxProps> = props => {
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

  return (
    <div className="hoverBox-Container">
      <props.Button
        disabled={isOptionsPage()}
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
        onExited={() => props.onHeightChanged && props.onHeightChanged(0)}
      >
        {() => (
          <div className="hoverBox-FloatBox">
            <FloatBox
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
        )}
      </CSSTransition>
    </div>
  )
}
