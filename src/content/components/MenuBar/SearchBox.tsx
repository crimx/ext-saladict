import React, { FC, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import i18next from 'i18next'
import { useEventCallback } from 'rxjs-hooks'
import { Observable, empty, timer } from 'rxjs'
import { map, debounce } from 'rxjs/operators'
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

  const inputRef = useRef<HTMLInputElement>(null)

  const [onFocusBlur, showSuggest] = useEventCallback(
    (event$: Observable<{ type: string; _immediate?: boolean }>) =>
      event$.pipe(
        // synthetic event
        map(e => [e.type !== 'blur', e._immediate]),
        debounce(e => (e[1] ? empty() : timer(100))),
        map(e => e[0])
      ),
    false
  )

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
          onFocusBlur({ type: 'focus', _immediate: true })
        }}
        onKeyUp={e => {
          if (e.key === 'Enter') {
            props.onSearch(props.text)
            onFocusBlur({ type: 'blur', _immediate: true })
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
        in={!!(props.enableSuggest && showSuggest && props.text)}
        timeout={100}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <div className="menuBar-SearchBox_Suggests">
          <Suggest
            text={text}
            onSelect={text => {
              onFocusBlur({ type: 'blur', _immediate: true })
              props.onSearch(text)
            }}
            onFocus={onFocusBlur}
            onBlur={onFocusBlur}
          />
        </div>
      </CSSTransition>
    </div>
  )
}
