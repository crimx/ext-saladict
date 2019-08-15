import React, { FC, useRef } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import AutosizeTextarea from 'react-textarea-autosize'

export interface MtaBoxProps {
  expand: boolean
  maxHeight: number
  text: string
  searchText: (text: string) => any
  onInput: (text: string) => void
  /** Expand or Shrink */
  onDrawerToggle: () => void
}

/**
 * Multiline Textarea Drawer. With animation on Expanding and Shrinking.
 */
export const MtaBox: FC<MtaBoxProps> = props => {
  const heightRef = useRef(0)

  const setHeight = (el: HTMLElement) => {
    el.style.height = heightRef.current + 'px'
  }

  return (
    <div>
      <CSSTransition
        in={props.expand}
        timeout={400}
        classNames="mtaBox-TextArea-Wrap"
        appear
        mountOnEnter
        unmountOnExit
        onEnter={resetHeight}
        onEntering={setHeight}
        onEntered={removeHeight}
        onExit={setHeight}
        onExiting={resetHeight}
        onExited={removeHeight}
      >
        {() => (
          <div className="mtaBox-TextArea-Wrap">
            <AutosizeTextarea
              className="mtaBox-TextArea"
              style={{ maxHeight: props.maxHeight }}
              value={props.text}
              onChange={e => props.onInput(e.currentTarget.value)}
              minRows={2}
              onHeightChange={height =>
                (heightRef.current = Math.min(props.maxHeight, height))
              }
            />
          </div>
        )}
      </CSSTransition>
      <button className="mtaBox-DrawerBtn" onClick={props.onDrawerToggle}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 59.414 59.414"
          className={`mtaBox-DrawerBtn_Arrow${props.expand ? ' isExpand' : ''}`}
        >
          <path d="M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56" />
        </svg>
      </button>
    </div>
  )
}

export default MtaBox

function resetHeight(el: HTMLElement) {
  el.style.height = '0'
}

function removeHeight(el: HTMLElement) {
  el.style.removeProperty('height')
}
