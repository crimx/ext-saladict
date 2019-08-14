import { combineReducers, Dispatch } from 'redux'
import { Action, ActionType } from '../utils/types'

import {
  ActionCatalog as ConfigActionCatalog,
  State as ConfigState,
  reducer as configReducer
} from './config'

import {
  ActionCatalog as SelectionActionCatalog,
  State as SelectionState,
  reducer as SelectionReducer
} from './selection'

export type StoreActionCatalog = ConfigActionCatalog & SelectionActionCatalog

export type StoreState = {
  config: ConfigState
  selection: SelectionState
}

export type StoreAction = Action<StoreActionCatalog>

export type StoreActionType = ActionType<StoreActionCatalog>

export type StoreDispatch = Dispatch<StoreAction>

export const rootReducer = combineReducers<StoreState, StoreAction>({
  config: configReducer,
  selection: SelectionReducer
})

export default rootReducer
