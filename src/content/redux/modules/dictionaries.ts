import { DictID, appConfigFactory } from '@/app-config'
import { Actions as ConfigActions } from './config'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  UPDATE_HEIGHT = 'dicts/UPDATE_HEIGHT',
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export const enum SearchStatus {
  OnHold,
  Searching,
  Finished,
}

export type DictionariesState = {
  [k in DictID]?: {
    searchStatus: SearchStatus
    searchResult: any
    height: number
  }
}

const initState: DictionariesState = appConfigFactory().dicts.selected
  .reduce((state, id) => {
    state[id] = {
      searchStatus: SearchStatus.OnHold,
      searchResult: null,
      height: 10,
    }
    return state
  }, {})

export default function reducer (state = initState, action): DictionariesState {
  switch (action.type) {
    case ConfigActions.NEW_CONFIG:
      return action.payload.dicts.selected
        .reduce((newState, id) => {
          newState[id] = state[id] || {
            searchStatus: SearchStatus.OnHold,
            searchResult: null,
            height: 10,
          }
          return newState
        }, {})
    case Actions.UPDATE_HEIGHT: {
      const { id, height } = action.payload
      return { ...state, [id]: { ...state[id], height } }
    }
    default:
      return state
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

type Action = { type: Actions, payload?: any }

export function newItemHeight (payload: { id: DictID, height: number }): Action {
  return ({ type: Actions.UPDATE_HEIGHT, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/
