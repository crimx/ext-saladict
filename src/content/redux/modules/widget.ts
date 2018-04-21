import * as recordManager from '@/_helpers/record-manager'
import { StoreState } from './index'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  PIN = 'widget/PIN',
  FAV_WORD = 'dicts/FAV_WORD',
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type WidgetState = {
  readonly isPinned: boolean
  readonly isFav: boolean
}

const initState: WidgetState = {
  isPinned: false,
  isFav: false,
}

export default function reducer (state = initState, action): WidgetState {
  switch (action.type) {
    case Actions.PIN:
      return { ...state, isPinned: !state.isPinned }
    case Actions.FAV_WORD:
      return state.isFav === action.payload
        ? state
        : { ...state, isFav: action.payload }
    default:
      return state
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

type Action = { type: Actions, payload?: any }

export function pinPanel (): Action {
  return { type: Actions.PIN }
}

export function favWord (payload: boolean): Action {
  return ({ type: Actions.FAV_WORD, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

type Dispatcher = (
  dispatch: (action: Action) => any,
  getState: () => StoreState,
) => any

export function addToNotebook (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.addToNotebook(getState().dictionaries.lastSearchInfo)
      .then(() => dispatch(favWord(true)))
  }
}

export function removeFromNotebook (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.removeFromNotebook(getState().dictionaries.lastSearchInfo)
      .then(() => dispatch(favWord(false)))
  }
}

/** Fire when panel is loaded */
export function updateFaveInfo (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.isInNotebook(getState().dictionaries.lastSearchInfo)
      .then(flag => dispatch(favWord(flag)))
  }
}
