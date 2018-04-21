import { DictID, appConfigFactory } from '@/app-config'
import { Actions as ConfigActions } from './config'
import isEqual from 'lodash/isEqual'

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
  readonly [k in DictID]?: {
    readonly searchStatus: SearchStatus
    readonly searchResult: any
    readonly height: number
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
    case ConfigActions.NEW_CONFIG: {
      const { selected } = action.payload.dicts
      return isEqual(selected, Object.keys(state))
        ? state
        : selected.reduce((newState, id) => {
          newState[id] = state[id] || {
            searchStatus: SearchStatus.OnHold,
            searchResult: null,
            height: 10,
          }
          return newState
        }, {})
    }
    case Actions.UPDATE_HEIGHT: {
      const { id, height } = action.payload
      return height === state[id].height
        ? state
        : { ...state, [id]: { ...state[id], height } }
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
