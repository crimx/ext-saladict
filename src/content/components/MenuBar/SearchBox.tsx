import React, { FC, useRef, useEffect, useState } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import i18next from 'i18next'
import {
  useObservableCallback,
  useObservableState,
  useObservable
} from 'observable-hooks'
import { identity, merge, combineLatest } from 'rxjs'
import { focusBlur } from '@/_helpers/observables'
import { Suggest } from './Suggest'
import { filter, map } from 'rxjs/operators'

export interface SearchBoxProps {
  t: i18next.TFunction
  /** Search box text */
  text: string
  /** Focus search box */
  shouldFocus: boolean
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

  const [onSearchBoxFocusBlur, searchBoxFocusBlur$] = useObservableCallback(
    focusBlur
  )

  const [onSuggestFocusBlur, suggestFocusBlur$] = useObservableCallback(
    focusBlur
  )

  const [onShowSugget, onShowSugget$] = useObservableCallback<boolean>(identity)

  const isShowSuggest = useObservableState(
    useObservable(
      inputs$ =>
        combineLatest(
          inputs$,
          merge(
            // only show suggest when start typing
            searchBoxFocusBlur$.pipe(filter(isFocus => !isFocus)),
            suggestFocusBlur$,
            onShowSugget$
          )
        ).pipe(
          map(([[enableSuggest, text], shouldShowSuggest]) =>
            Boolean(enableSuggest && text && shouldShowSuggest)
          )
        ),
      [props.enableSuggest, props.text] as [boolean, string]
    ),
    false
  )

  const isExpand = useObservableState(searchBoxFocusBlur$)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.shouldFocus && !isShowSuggest && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }) // Run on every update

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={`menuBar-SearchBox_Wrap${isExpand ? ' isExpand' : ''}`}>
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
            const firstSuggestBtn =
              suggestRef.current && suggestRef.current.querySelector('button')
            if (firstSuggestBtn) {
              firstSuggestBtn.focus()
            } else {
              onShowSugget(true)
            }
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onFocus={onSearchBoxFocusBlur}
        onBlur={onSearchBoxFocusBlur}
        value={text}
      />

      <CSSTransition
        classNames="menuBar-SearchBox_Suggest"
        in={isShowSuggest}
        timeout={100}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        {() => (
          <div className="menuBar-SearchBox_Suggests">
            <Suggest
              ref={suggestRef}
              text={text}
              onSelect={text => {
                onShowSugget(true)
                props.onSearch(text)
              }}
              onFocus={onSuggestFocusBlur}
              onBlur={onSuggestFocusBlur}
              onArrowUpFirst={focusInput}
              onClose={focusInput}
            />
          </div>
        )}
      </CSSTransition>
    </div>
  )
}
