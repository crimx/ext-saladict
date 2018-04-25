import { message } from '@/_helpers/browser-api'
import { DictID, appConfigFactory } from '@/app-config'
import { Actions as ConfigActions } from './config'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import { StoreState } from './index'
import { SelectionInfo, getDefaultSelectionInfo, isSameSelection } from '@/_helpers/selection'
import { MsgType, MsgFetchDictResult } from '@/typings/message'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  UPDATE_HEIGHT = 'dicts/UPDATE_HEIGHT',
  UPDATE_RESULT = 'dicts/UPDATE_RESULT',
  SEARCH_START = 'dicts/SEARCH_START',
  SEARCH_END = 'dicts/SEARCH_END',
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export const enum SearchStatus {
  OnHold,
  Searching,
  Finished,
}

type DictState = {
  readonly searchStatus: SearchStatus
  readonly searchResult: any
  readonly height: number
}

export type DictionariesState = {
  readonly dicts: {
    readonly [k in DictID]?: DictState
  }
  readonly lastSearchInfo: SelectionInfo
}

const initState: DictionariesState = {
  dicts: appConfigFactory().dicts.selected
    .reduce((state, id) => {
      state[id] = {
        searchStatus: SearchStatus.OnHold,
        searchResult: null,
        height: 30,
      }
      return state
    }, {}),
  lastSearchInfo: getDefaultSelectionInfo()
}

export default function reducer (state = initState, action): DictionariesState {
  switch (action.type) {
    case ConfigActions.NEW_CONFIG: {
      const { selected }: { selected: DictID[] } = action.payload.dicts
      return isEqual(selected, Object.keys(state))
        ? state
        : {
          ...state,
          dicts: selected.reduce((newState, id) => {
            newState[id] = state[id] || {
              searchStatus: SearchStatus.OnHold,
              searchResult: null,
              height: 10,
            }
            return newState
          }, {})
        }
    }
    case Actions.UPDATE_HEIGHT: {
      const { id, height }: { id: DictID, height: number } = action.payload
      return height === state[id].height
        ? state
        : {
          ...state,
          dicts: {
            ...state.dicts,
            [id]: { ...state[id], height }
          }
        }
    }
    case Actions.SEARCH_START: {
      const { id, info }: { id?: DictID, info: SelectionInfo } = action.payload
      return {
        ...state,
        lastSearchInfo: info,
        dicts: mapValues<typeof state.dicts, DictState>(
          state.dicts,
          (dictInfo, dictID) => {
            return (
              !id || dictID === id
                ? { ...dictInfo, searchStatus: SearchStatus.Searching, searchResult: null }
                : dictInfo
            ) as DictState
          }
        ),
      }
    }
    case Actions.SEARCH_END: {
      const { id, info, result }: { id: DictID, info: SelectionInfo, result: any } = action.payload
      return isSameSelection(info, state.lastSearchInfo)
        ? {
          ...state,
          dicts: {
            ...state.dicts,
            [id]: { ...state[id], searchStatus: SearchStatus.Finished, searchResult: result }
          }
        }
        : state // ignore the outdated selection
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

/** Search all selected dicts if id is not provided */
export function searchStart (payload: { id?: DictID, info: SelectionInfo }): Action {
  return ({ type: Actions.SEARCH_START, payload })
}

export function searchEnd (payload: { id: DictID, info: SelectionInfo, result: any }): Action {
  return ({ type: Actions.SEARCH_END, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

type Dispatcher = (
  dispatch: (action: Action) => any,
  getState: () => StoreState,
) => any

/**
 * Search all selected dicts if id is not provided.
 * Use last selection if info is not provided.
 */
export function searchText (arg?: { id?: DictID, info?: SelectionInfo | string }): Dispatcher {
  return (dispatch, getState) => {
    const state = getState()
    const info = arg
      ? typeof arg.info === 'string'
        ? getDefaultSelectionInfo({ text: arg.info })
        : arg.info || state.dictionaries.lastSearchInfo
      : state.dictionaries.lastSearchInfo

    const id = arg && arg.id

    dispatch(searchStart({ id, info }))

    const dicts = id ? [id] : state.config.dicts.selected

    dicts.forEach(id => {
      const msg: MsgFetchDictResult = {
        type: MsgType.FetchDictResult,
        id,
        text: info.text
      }
      return message.send(msg)
        .then(result => {
          dispatch(searchEnd({ id, info, result }))
        })
        .catch(() => {
          dispatch(searchEnd({ id, info , result: null }))
        })
    })
  }
}
