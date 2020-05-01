import React, { FC, useRef, useEffect } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { TFunction } from 'i18next'
import {
  useObservableCallback,
  useObservableState,
  useObservable,
  identity
} from 'observable-hooks'
import { merge, combineLatest } from 'rxjs'
import { filter, map, distinctUntilChanged, mapTo } from 'rxjs/operators'
import { focusBlur } from '@/_helpers/observables'
import { message } from '@/_helpers/browser-api'
import { Suggest } from './Suggest'
import { SearchBtn } from './MenubarBtns'

export interface SearchBoxProps {
  t: TFunction
  /** Search box text */
  text: string
  /** Focus search box */
  shouldFocus: boolean
  /** Show suggest panel when typing */
  enableSuggest: boolean
  onInput: (text: string) => any
  /** Start searching */
  onSearch: (text: string) => any

  onHeightChanged: (height: number) => void
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
            onShowSugget$,
            message.createStream('SEARCH_TEXT_BOX').pipe(mapTo(false))
          )
        ).pipe(
          map(([[enableSuggest, text], shouldShowSuggest]) =>
            Boolean(enableSuggest && text && shouldShowSuggest)
          ),
          distinctUntilChanged()
        ),
      [props.enableSuggest, props.text]
    ),
    false
  )

  const isExpand = useObservableState(searchBoxFocusBlur$)

  const hasTypedRef = useRef(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestRef = useRef<HTMLDivElement>(null)

  const focusInput = useRef(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }).current

  const searchText = (text: unknown) => {
    hasTypedRef.current = false
    onShowSugget(false)
    props.onSearch(typeof text === 'string' ? text : props.text)
    focusInput()
  }

  useEffect(() => {
    if (props.shouldFocus && !hasTypedRef.current && !isShowSuggest) {
      focusInput()
    }
  }, [props.text])

  return (
    <>
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
          onKeyDown={e => {
            // prevent page shortkeys
            e.nativeEvent.stopPropagation()

            hasTypedRef.current = true
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
            } else if (e.key === 'Enter') {
              searchText(props.text)
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
          onExited={() => props.onHeightChanged(0)}
        >
          {() => (
            <div className="menuBar-SearchBox_Suggests">
              <Suggest
                ref={suggestRef}
                text={text}
                onSelect={searchText}
                onFocus={onSuggestFocusBlur}
                onBlur={onSuggestFocusBlur}
                onArrowUpFirst={focusInput}
                onClose={focusInput}
                onHeightChanged={props.onHeightChanged}
              />
            </div>
          )}
        </CSSTransition>
      </div>
      <SearchBtn t={props.t} onClick={searchText} />
    </>
  )
}
