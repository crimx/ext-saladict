import { combineEpics } from 'redux-observable'
import { mapTo } from 'rxjs/operators'
import { StoreAction, StoreState } from '../'
import { ofType } from '../../utils/operators'

import searchStartEpic from './searchStart.epic'
import newSelectionEpic from './newSelection.epic'

export const epics = combineEpics<StoreAction, StoreAction, StoreState>(
  /** Start searching text. This will also send to Redux. */
  action$ =>
    action$.pipe(
      ofType('BOWL_ACTIVATED'),
      mapTo({ type: 'SEARCH_START' })
    ),
  newSelectionEpic,
  searchStartEpic
)

export default epics
