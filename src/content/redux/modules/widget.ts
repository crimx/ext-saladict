import * as recordManager from '@/_helpers/record-manager'
import { StoreState } from './index'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  PIN = 'widget/PIN',
  FAV_WORD = 'dicts/FAV_WORD',
  MOUSE_ON_BOWL = 'disct/MOUSE_ON_BOWL',
  SHOW_PANEL = 'disct/SHOW_PANEL',
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type WidgetState = {
  readonly isPinned: boolean
  readonly isFav: boolean
  readonly isMouseOnBowl: boolean
  readonly isPanelShow: boolean
}

const initState: WidgetState = {
  isPinned: false,
  isFav: false,
  isMouseOnBowl: false,
  isPanelShow: false,
}

export default function reducer (state = initState, action): WidgetState {
  switch (action.type) {
    case Actions.PIN:
      return { ...state, isPinned: !state.isPinned }
    case Actions.FAV_WORD:
      return state.isFav === action.payload
        ? state
        : { ...state, isFav: action.payload }
    case Actions.MOUSE_ON_BOWL:
      return state.isMouseOnBowl === action.payload
        ? state
        : { ...state, isMouseOnBowl: action.payload }
    case Actions.SHOW_PANEL:
      return state.isPanelShow === action.payload
        ? state
        : { ...state, isPanelShow: action.payload }
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

export function mouseOnBowl (payload: boolean): Action {
  return ({ type: Actions.MOUSE_ON_BOWL, payload })
}

export function showPanel (payload: boolean): Action {
  return ({ type: Actions.SHOW_PANEL, payload })
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
    return recordManager.addToNotebook(getState().dictionaries.searchHistory[0])
      .then(() => dispatch(favWord(true)))
  }
}

export function removeFromNotebook (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.removeFromNotebook(getState().dictionaries.searchHistory[0])
      .then(() => dispatch(favWord(false)))
  }
}

/** Fire when panel is loaded */
export function updateFaveInfo (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.isInNotebook(getState().dictionaries.searchHistory[0])
      .then(flag => dispatch(favWord(flag)))
  }
}
