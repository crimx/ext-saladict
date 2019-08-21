import React, { FC, useRef, useState, useEffect } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import AutosizeTextarea from 'react-textarea-autosize'
import { useObservableState } from 'observable-hooks'
import { switchMap, mapTo, startWith } from 'rxjs/operators'
import { timer, Observable } from 'rxjs'

export interface MtaBoxProps {
  expand: boolean
  maxHeight: number
  text: string
  shouldFocus: boolean
  searchText: (text: string) => any
  onInput: (text: string) => void
  /** Expand or Shrink */
  onDrawerToggle: () => void
}

/**
 * Multiline Textarea Drawer. With animation on Expanding and Shrinking.
 */
export const MtaBox: FC<MtaBoxProps> = props => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [height, setHeight] = useState(0)

  const [isTyping, onKeyDown] = useObservableState(transformTyping, false)

  const [hasTyped, setHasTyped] = useState(false)

  useEffect(() => {
    if (!props.expand) {
      setHasTyped(false)
    } else if (isTyping) {
      setHasTyped(true)
    }
  }, [props.expand, isTyping])

  useEffect(() => {
    if (
      !isTyping &&
      !hasTyped &&
      props.expand &&
      props.shouldFocus &&
      textareaRef.current
    ) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }) // run on every update

  return (
    <div>
      <div
        className={`mtaBox-TextArea-Wrap${isTyping ? ' isTyping' : ''}`}
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
              inputRef={textareaRef}
              className="mtaBox-TextArea"
              style={{ maxHeight: props.maxHeight }}
              value={props.text}
              onChange={e => props.onInput(e.currentTarget.value)}
              onKeyDown={onKeyDown}
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

function transformTyping(event$: Observable<React.KeyboardEvent>) {
  return event$.pipe(
    switchMap(() =>
      timer(1000).pipe(
        mapTo(false),
        startWith(true)
      )
    )
  )
}
