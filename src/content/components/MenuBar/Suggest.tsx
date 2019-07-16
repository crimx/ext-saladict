import React, { FocusEvent, FC } from 'react'
import { useObservable } from 'rxjs-hooks'
import { from } from 'rxjs'
import {
  map,
  filter,
  distinctUntilChanged,
  switchMap,
  debounceTime,
  startWith
} from 'rxjs/operators'
import { message } from '@/_helpers/browser-api'
import AnimateHeight from 'react-animate-height'

export interface SuggestItem {
  explain: string
  entry: string
}

export interface SuggestProps {
  /** Search box text */
  text: string
  onFocus: (e: FocusEvent<HTMLButtonElement>) => any
  onBlur: (e: FocusEvent<HTMLButtonElement>) => any
  /** When a suggestion is selected */
  onSelect: (text: string) => any
}

/**
 * Suggest panel offering similar words.
 */
export const Suggest: FC<SuggestProps> = props => {
  type SuggestsResult = [boolean, SuggestItem[]]
  const [isLoading, suggests] = useObservable<SuggestsResult, [string]>(
    inputs$ =>
      inputs$.pipe(
        map(([text]) => text),
        filter<string>(Boolean),
        distinctUntilChanged(),
        debounceTime(750),
        switchMap(text =>
          from(
            message
              .send<'GET_SUGGESTS'>({
                type: 'GET_SUGGESTS',
                payload: text
              })
              .catch(() => [])
          ).pipe(
            map(suggests => [false, suggests] as SuggestsResult),
            startWith([true, []] as SuggestsResult)
          )
        )
      ),
    [!!props.text, []] as SuggestsResult,
    [props.text]
  )

  return (
    <div className="menuBar-SuggestsContainer">
      <AnimateHeight height={isLoading ? 32 : 'auto'}>
        {isLoading ? (
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <div className="menuBar-Suggests">
            {suggests.map(s => (
              <button
                key={s.entry}
                className="menuBar-SuggestsBtn"
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                onClick={e => props.onSelect(e.currentTarget.dataset.entry!)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') {
                    const $nextLi = e.currentTarget.nextSibling
                    if ($nextLi) {
                      ;($nextLi as HTMLButtonElement).focus()
                    }
                    e.preventDefault()
                    e.stopPropagation()
                  } else if (e.key === 'ArrowUp') {
                    const $prevLi = e.currentTarget.previousSibling
                    if ($prevLi) {
                      ;($prevLi as HTMLButtonElement).focus()
                    }
                    e.preventDefault()
                    e.stopPropagation()
                  } else if (e.key === 'Escape') {
                    const doc = e.currentTarget.ownerDocument
                    if (doc) {
                      const searchBox = doc.querySelector<HTMLInputElement>(
                        '.menuBar-SearchBox'
                      )
                      if (searchBox) {
                        searchBox.focus()
                      }
                    }
                    // prevent the dict panel being closed
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                data-entry={s.entry}
              >
                <span className="menuBar-SuggestsEntry">{s.entry}</span>
                <span className="menuBar-SuggestsExplain">{s.explain}</span>
              </button>
            ))}
          </div>
        )}
      </AnimateHeight>
    </div>
  )
}
