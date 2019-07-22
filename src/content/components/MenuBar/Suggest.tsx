import React, { FocusEvent, FC } from 'react'
import { useObservable, useObservableState } from 'observable-hooks'
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
  /** Focus back on input box */
  onFocusInput: () => any
}

/**
 * Suggest panel offering similar words.
 */
export const Suggest: FC<SuggestProps> = props => {
  const body = useObservableState(
    useObservable(
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
              map(suggests => (
                <AnimateHeight height="auto">
                  <StateFinish suggests={suggests} {...props} />
                </AnimateHeight>
              )),
              startWith(
                <AnimateHeight height={32}>
                  <StateLoading />
                </AnimateHeight>
              )
            )
          ),
          startWith(
            <AnimateHeight height={32}>
              <StateLoading />
            </AnimateHeight>
          )
        ),
      [props.text]
    )
  )!

  return <div className="menuBar-SuggestsContainer">{body}</div>
}

function StateLoading() {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

type StateFinishProps = { suggests: SuggestItem[] } & Pick<
  SuggestProps,
  'onFocus' | 'onBlur' | 'onSelect' | 'onFocusInput'
>

function StateFinish(props: StateFinishProps) {
  return (
    <div className="menuBar-Suggests">
      {props.suggests.map(s => (
        <button
          key={s.entry}
          className="menuBar-SuggestsBtn"
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onClick={e => props.onSelect(e.currentTarget.dataset.entry!)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              e.stopPropagation()
              const $nextLi = e.currentTarget.nextSibling
              if ($nextLi) {
                ;($nextLi as HTMLButtonElement).focus()
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              e.stopPropagation()
              const $prevLi = e.currentTarget.previousSibling
              if ($prevLi) {
                ;($prevLi as HTMLButtonElement).focus()
              } else {
                props.onFocusInput()
              }
            } else if (e.key === 'Escape') {
              // prevent the dict panel being closed
              e.preventDefault()
              e.stopPropagation()
              props.onFocusInput()
            }
          }}
          data-entry={s.entry}
        >
          <span className="menuBar-SuggestsEntry">{s.entry}</span>
          <span className="menuBar-SuggestsExplain">{s.explain}</span>
        </button>
      ))}
    </div>
  )
}
