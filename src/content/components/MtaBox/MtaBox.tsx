import React, { FC, useRef, useState } from 'react'
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
  const [height, setHeight] = useState(0)
  const [isFocus, setFocus] = useState(false)

  const onFocusBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocus(e.type === 'focus')
  }

  return (
    <div>
      <div
        className={`mtaBox-TextArea-Wrap${isFocus ? '' : ' isAnimate'}`}
        style={{
          height: props.expand ? height : 0,
          maxHeight: props.maxHeight
        }}
      >
        <CSSTransition
          in={props.expand}
          timeout={400}
          classNames="mtaBox-TextArea-Wrap"
          appear
          mountOnEnter
          unmountOnExit
        >
          {() => (
            <AutosizeTextarea
              className="mtaBox-TextArea"
              style={{ maxHeight: props.maxHeight }}
              value={props.text}
              onChange={e => props.onInput(e.currentTarget.value)}
              onFocus={onFocusBlur}
              onBlur={onFocusBlur}
              minRows={2}
              onHeightChange={height => setHeight(height)}
            />
          )}
        </CSSTransition>
      </div>
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
