import { combineReducers, Dispatch } from 'redux'
import { Action, ActionType } from '../utils/types'

import {
  Payload as ConfigPayload,
  State as ConfigState,
  reducer as configReducer
} from './config'

import {
  Payload as SelectionPayload,
  State as SelectionState,
  reducer as SelectionReducer
} from './selection'

type StorePayload = ConfigPayload & SelectionPayload

export type StoreState = {
  config: ConfigState
  selection: SelectionState
}

export type StoreAction = Action<StorePayload>

export type StoreActionType = ActionType<StorePayload>

export type StoreDispatch = Dispatch<StoreAction>

export const rootReducer = combineReducers<StoreState, StoreAction>({
  config: configReducer,
  selection: SelectionReducer
})

export default rootReducer
