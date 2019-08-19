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

import {
  ActionCatalog as WidgetActionCatalog,
  State as WidgetState,
  reducer as WidgetReducer
} from './widget'

export type StoreActionCatalog = ConfigActionCatalog &
  SelectionActionCatalog &
  WidgetActionCatalog

export type StoreState = {
  config: ConfigState
  selection: SelectionState
  widget: WidgetState
}

export type StoreAction = Action<StoreActionCatalog>

export type StoreActionType = ActionType<StoreActionCatalog>

export type StoreDispatch = Dispatch<StoreAction>

export const rootReducer = combineReducers<StoreState, StoreAction>({
  config: configReducer,
  selection: SelectionReducer,
  widget: WidgetReducer
})

export default rootReducer
