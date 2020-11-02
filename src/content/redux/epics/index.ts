import { combineEpics } from 'redux-observable'
import { from, of, EMPTY } from 'rxjs'
import { map, mapTo, mergeMap, filter, pairwise } from 'rxjs/operators'

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
      ofType('SWITCH_HISTORY'),
      mapTo({ type: 'SEARCH_START', payload: { noHistory: true } })
    ),
  (action$, state$) =>
    state$.pipe(
      map(state => state.isShowDictPanel),
      pairwise(),
      mergeMap(([oldShow, newShow]) => {
        if (oldShow && !newShow) {
          message.send({ type: 'STOP_AUDIO' })
        }
        return EMPTY
      })
    ),
  (action$, state$) =>
    action$.pipe(
      ofType('ADD_TO_NOTEBOOK'),
      mergeMap(() => {
        if (state$.value.config.editOnFav) {
          const word = state$.value.searchHistory[state$.value.historyIndex]

          if (isPopupPage() || isStandalonePage()) {
            const { width: screenWidth, height: screenHeight } = window.screen
            const width = Math.round(Math.min(Math.max(screenWidth, 440), 640))
            const height = Math.round(Math.min(screenHeight - 150, 800))

            let wordString = ''
            try {
              wordString = encodeURIComponent(JSON.stringify(word))
            } catch (e) {
              console.warn(e)
            }

            browser.windows
              .create({
                type: 'popup',
                url: browser.runtime.getURL(
                  `word-editor.html?word=${wordString}`
                ),
                top: Math.round((screenHeight - height) / 2),
                left: Math.round((screenWidth - width) / 2),
                width,
                height
              })
              .catch(e => {
                console.warn(e)
              })

            return EMPTY
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
