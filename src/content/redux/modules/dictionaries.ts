import { message } from '@/_helpers/browser-api'
import { DictID, appConfigFactory } from '@/app-config'
import { Actions as ConfigActions } from './config'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import { SelectionInfo, getDefaultSelectionInfo, isSameSelection } from '@/_helpers/selection'
import { MsgType, MsgFetchDictResult } from '@/typings/message'
import { StoreState } from './index'
import { isInNotebook } from './widget'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  SEARCH_START = 'dicts/SEARCH_START',
  SEARCH_END = 'dicts/SEARCH_END',
  RESTORE = 'dicts/RESTORE',
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
}

export type DictionariesState = {
  readonly dicts: {
    readonly [k in DictID]?: DictState
  }
  readonly searchHistory: SelectionInfo[]
}

const initState: DictionariesState = {
  dicts: appConfigFactory().dicts.selected
    .reduce((state, id) => {
      state[id] = {
        searchStatus: SearchStatus.OnHold,
        searchResult: null,
      }
      return state
    }, {}),
  searchHistory: [],
}

export default function reducer (state = initState, action): DictionariesState {
  switch (action.type) {
    case Actions.RESTORE:
      return {
        ...state,
        dicts: Object.keys(state.dicts).reduce((newDicts, id) => {
          newDicts[id] =
            state.dicts[id].searchStatus === SearchStatus.OnHold
              ? state.dicts[id]
              : {
                searchStatus: SearchStatus.OnHold,
                searchResult: null,
              }
          return newDicts
        }, {})
      }
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
            }
            return newState
          }, {})
        }
    }
    case Actions.SEARCH_START: {
      const toOnhold: Set<string> = new Set(action.payload.toOnhold)
      const toStart: Set<string> = new Set(action.payload.toStart)
      const info = action.payload.info
      const history = state.searchHistory
      return {
        ...state,
        searchHistory: info === history[0] ? history : [info, ...history].slice(0, 20),
        dicts: mapValues<typeof state.dicts, DictState>(
          state.dicts,
          (dictInfo, dictID) => {
            if (toStart.has(dictID)) {
              return {
                ...dictInfo,
                searchStatus: SearchStatus.Searching,
                searchResult: null,
              }
            } else if (toOnhold.has(dictID)) {
              return {
                ...dictInfo,
                searchStatus: SearchStatus.OnHold,
                searchResult: null,
              }
            }

            return dictInfo as DictState
          }
        ),
      }
    }
    case Actions.SEARCH_END: {
      const { id, info, result }: { id: DictID, info: SelectionInfo, result: any } = action.payload
      return isSameSelection(info, state.searchHistory[0])
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

export function restoreDicts (): Action {
  return ({ type: Actions.RESTORE })
}

/** Search all selected dicts if id is not provided */
export function searchStart (
  payload: {toOnhold: DictID[], toStart: DictID[], info: SelectionInfo }
): Action {
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
      : arg.info || state.dictionaries.searchHistory[0]
    : state.dictionaries.searchHistory[0]

    dispatch(isInNotebook(info) as any)

    const requestID = arg && arg.id

    // search one dict
    if (requestID) {
      dispatch(searchStart({ toStart: [requestID], toOnhold: [], info }))
      doSearch(requestID)
      return
    }

    // search all, except the onholded
    const { selected: selectedDicts, all: allDicts } = state.config.dicts
    const toStart: DictID[] = []
    const toOnhold: DictID[] = []
    selectedDicts.forEach(id => {
      if (allDicts[id].defaultUnfold) {
        toStart.push(id)
      } else {
        toOnhold.push(id)
      }
    })

    dispatch(searchStart({ toStart, toOnhold, info }))
    toStart.forEach(doSearch)

    function doSearch (id: DictID) {
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
    }
  }
}
