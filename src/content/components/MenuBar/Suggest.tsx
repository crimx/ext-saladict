import React, { FC } from 'react'
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
import { FloatBox, FloatBoxProps } from '@/components/FloatBox'

export interface SuggestItem {
  explain: string
  entry: string
}

export type SuggestProps = {
  /** Search box text */
  text: string
} & Pick<
  FloatBoxProps,
  | 'ref'
  | 'onFocus'
  | 'onBlur'
  | 'onSelect'
  | 'onArrowUpFirst'
  | 'onClose'
  | 'onHeightChanged'
>

/**
 * Suggest panel offering similar words.
 */
export const Suggest: FC<SuggestProps> = React.forwardRef(
  (props: SuggestProps, ref: React.Ref<HTMLDivElement>) => {
    return useObservableState(
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
                  .catch(() => [] as readonly SuggestItem[])
              ).pipe(
                map(suggests => (
                  <FloatBox
                    ref={ref}
                    list={suggests.map(s => ({
                      key: s.entry,
                      value: s.entry,
                      label: (
                        <>
                          <span className="menuBar-SuggestsEntry">
                            {s.entry}
                          </span>
                          <span className="menuBar-SuggestsExplain">
                            {s.explain}
                          </span>
                        </>
                      )
                    }))}
                    {...props}
                  />
                )),
                startWith(<FloatBox {...props} />)
              )
            )
          ),
        [props.text]
      ),
      () => <FloatBox {...props} />
    )
  }
)
