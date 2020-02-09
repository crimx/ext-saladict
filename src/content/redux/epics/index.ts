import { combineEpics } from 'redux-observable'
import { from, of, empty } from 'rxjs'
import { map, mapTo, mergeMap, filter } from 'rxjs/operators'

import { isPopupPage, isStandalonePage } from '@/_helpers/saladict'
import { saveWord } from '@/_helpers/record-manager'

import { StoreAction, StoreState } from '../modules'
import { ofType } from './utils'

import searchStartEpic from './searchStart.epic'
import newSelectionEpic from './newSelection.epic'
import { translateCtxs, genCtxText } from '@/_helpers/translateCtx'
import { message } from '@/_helpers/browser-api'

export const epics = combineEpics<StoreAction, StoreAction, StoreState>(
  /** Start searching text. This will also send to Redux. */
  (action$, state$) =>
    action$.pipe(
      ofType('BOWL_ACTIVATED'),
      map(
        () =>
          state$.value.selection.word
            ? {
                type: 'SEARCH_START',
                payload: { word: state$.value.selection.word }
              }
            : { type: 'SEARCH_START' } // this should never be reached
      )
    ),
  (action$, state$) =>
    action$.pipe(
      ofType('ADD_TO_NOTEBOOK'),
      mergeMap(() => {
        if (state$.value.config.editOnFav) {
          const word =
            state$.value.searchHistory[state$.value.searchHistory.length - 1]

          if (isPopupPage() || isStandalonePage()) {
            try {
              message.send({
                type: 'OPEN_URL',
                payload: {
                  url: `notebook.html?word=${encodeURIComponent(
                    JSON.stringify(word)
                  )}`,
                  self: true
                }
              })
              return empty()
            } catch (e) {}
          }

          return of({
            type: 'WORD_EDITOR_STATUS',
            payload: { word, translateCtx: true }
          } as const)
        }

        return from(
          (async () => {
            const word =
              state$.value.searchHistory[state$.value.searchHistory.length - 1]
            if (word) {
              try {
                word.trans = genCtxText(
                  word.trans,
                  await translateCtxs(
                    word.context || word.text,
                    state$.value.config.ctxTrans
                  )
                )
                await saveWord('notebook', word)
                return true
              } catch (e) {
                console.warn(e)
                return false
              }
            }
            return false
          })()
        ).pipe(
          // dim icon if failed
          filter(isSuccess => !isSuccess),
          mapTo({ type: 'WORD_IN_NOTEBOOK', payload: false } as const)
        )
      })
    ),
  newSelectionEpic,
  searchStartEpic
)

export default epics
