import React, { FC, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import i18next from 'i18next'
import {
  useObservableCallback,
  useObservableState,
  useObservable
} from 'observable-hooks'
import { identity, merge } from 'rxjs'
import { map, debounceTime } from 'rxjs/operators'
import { Suggest } from './Suggest'

export interface SearchBoxProps {
  t: i18next.TFunction
  /** Search box text */
  text: string
  /** Focus search box on mount */
  isFocusOnMount: boolean
  /** Show suggest panel when typing */
  enableSuggest: boolean
  onInput: (text: string) => any
  /** Start searching */
  onSearch: (text: string) => any
}

/**
 * Seach box
 */
export const SearchBox: FC<SearchBoxProps> = props => {
  // Textarea also shares the text so only replace here
  const text = props.text.replace(/\s+/g, ' ')

  const [onFocusBlur, focusBlur$] = useObservableCallback<
    boolean,
    { type: string }
  >(event$ =>
    event$.pipe(
      map(e => e.type !== 'blur'),
      debounceTime(100)
    )
  )

  const [onShowSugget, onShowSugget$] = useObservableCallback<boolean>(identity)

  const shouldShowSuggest = useObservableState(
    useObservable(() => merge(focusBlur$, onShowSugget$)),
    false
  )

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (props.isFocusOnMount && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  return (
    <div className="menuBar-SearchBox_Wrap">
      <input
        type="text"
        className="menuBar-SearchBox"
        key="search-box"
        ref={inputRef}
        onChange={e => {
          props.onInput(e.currentTarget.value)
          onShowSugget(true)
        }}
        onKeyUp={e => {
          if (e.key === 'Enter') {
            props.onSearch(props.text)
            onShowSugget(false)
          }
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            const doc = e.currentTarget.ownerDocument
            if (doc) {
              const firstSuggestBtn = doc.querySelector<HTMLButtonElement>(
                '.menuBar-SuggestsBtn'
              )
              if (firstSuggestBtn) {
                firstSuggestBtn.focus()
              }
            }
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onBlur={onFocusBlur}
        value={text}
      />

      <CSSTransition
        classNames="menuBar-SearchBox_Suggest"
        in={!!(props.enableSuggest && shouldShowSuggest && props.text)}
        timeout={100}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <div className="menuBar-SearchBox_Suggests">
          <Suggest
            text={text}
            onSelect={text => {
              onShowSugget(true)
              props.onSearch(text)
            }}
            onFocus={onFocusBlur}
            onBlur={onFocusBlur}
            onFocusInput={() => {
              if (inputRef.current) {
                inputRef.current.focus()
              }
            }}
          />
        </div>
      </CSSTransition>
    </div>
  )
}
