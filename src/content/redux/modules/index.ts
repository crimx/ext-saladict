import { combineReducers } from 'redux'
import mergeUniqueObjects from '../utils/merge-unique-objects'

import {
  reducer as configReducer,
  initState as configInitState,
  ActionType as ConfigActionType,
  ConfigState,
} from './config'

import {
  reducer as widgetReducer,
  initState as widgetInitState,
  ActionType as widgetActionType,
  WidgetState,
} from './widget'

import {
  reducer as dictionariesReducer,
  initState as dictionariesInitState,
  ActionType as dictionariesActionType,
  DictionariesState,
} from './dictionaries'

import {
  reducer as selectionReducer,
  initState as selectionInitState,
  ActionType as selectionActionType,
  SelectionState,
} from './selection'

export type StoreState =
  ConfigState &
  WidgetState &
  DictionariesState &
  SelectionState

export type ActionType =
  ConfigActionType |
  widgetActionType |
  dictionariesActionType |
  selectionActionType

/** Thunk dispatcher */
export type Dispatcher = (action: { type: ActionType, payload?: any } | DispatcherThunk) => any

export type DispatcherThunk = (
  dispatch: Dispatcher,
  getState: () => StoreState
) => any

const storeInitState: StoreState = mergeUniqueObjects(
  configInitState,
  widgetInitState,
  dictionariesInitState,
  selectionInitState,
)

const storeReducer = mergeUniqueObjects(
  configReducer,
  widgetReducer,
  dictionariesReducer,
  selectionReducer,
)

export default function reducer (
  state = storeInitState,
  action: { type: ActionType, payload: any },
): StoreState {
  if (typeof storeReducer[action.type] === 'function') {
    // @ts-ignore
    return storeReducer[action.type](state, action.payload)
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!action.type.startsWith('@@')) {
      console.error(`Action ${action.type} doesn't have a handler`)
    }
  }

  return state
}
