import { Dispatch } from 'redux'
import { initState } from './state'
import { ActionCatalog } from './action-catalog'
import { Action, ActionType, ActionHandler } from '../utils/types'
export { createRootReducer } from './reducer'

export type StoreState = ReturnType<typeof initState>

export type StoreActionCatalog = ActionCatalog

export type StoreAction = Action<ActionCatalog>

export type StoreActionType = ActionType<ActionCatalog>

export type StoreActionHandler<T extends StoreActionType> = ActionHandler<
  ActionCatalog,
  StoreState,
  T
>

export type StoreDispatch = Dispatch<StoreAction>
