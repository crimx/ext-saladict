import { combineEpics } from 'redux-observable'
import { map, mapTo, mergeMap, filter } from 'rxjs/operators'

import { saveWord } from '@/_helpers/record-manager'

import { StoreAction, StoreState } from '../'
import { ofType } from '../../utils/operators'

import searchStartEpic from './searchStart.epic'
import newSelectionEpic from './newSelection.epic'

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
      mergeMap(async () => {
        const word =
          state$.value.searchHistory[state$.value.searchHistory.length - 1]
        if (word) {
          try {
            await saveWord('notebook', word)
            return true
          } catch (e) {
            return false
          }
        }
        return false
      }),
      // dim icon if failed
      filter(isSuccess => !isSuccess),
      mapTo({ type: 'WORD_IN_NOTEBOOK', payload: false })
    ),
  newSelectionEpic,
  searchStartEpic
)

export default epics
