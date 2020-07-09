import { Action, ActionType, createReducer } from 'retux'
import {
  ThunkAction as CreateThunkAction,
  ThunkDispatch as CreateThunkDispatch
} from 'redux-thunk'
import { initState, State } from './state'
import { ActionCatalog } from './action-catalog'
import { actionHandlers } from './action-handlers'

export type StoreState = State

export type StoreActionCatalog = ActionCatalog

export type StoreActionType = ActionType<StoreActionCatalog>

export type StoreAction<T extends StoreActionType = StoreActionType> = Action<
  StoreActionCatalog,
  T
>

export type ThunkAction<
  Type extends StoreActionType = StoreActionType,
  Result = void
> = CreateThunkAction<
  Result,
  StoreState,
  never,
  Action<StoreActionCatalog, Type>
>

export type StoreDispatch<
  Type extends StoreActionType = StoreActionType
> = CreateThunkDispatch<StoreState, never, StoreAction<Type>>

export const getRootReducer = async () => {
  return createReducer(await initState(), actionHandlers)
}
