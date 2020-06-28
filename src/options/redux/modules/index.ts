import { Action, ActionType, createReducer } from 'retux'
import {
  ThunkAction as CreateThunkAction,
  ThunkDispatch as CreateThunkDispatch
} from 'redux-thunk'
import { initState, State } from './state'
import { ActionCatalog } from './action-catalog'
import { actionHandlers } from './action-handlers'
import {
  useSelector as _useSelector,
  useDispatch as _useDispatch
} from 'react-redux'

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

export const useSelector: <TSelected = unknown>(
  selector: (state: StoreState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => TSelected = _useSelector

export const useDispatch: () => StoreDispatch = _useDispatch

export const getRootReducer = async () => {
  return createReducer(await initState(), actionHandlers)
}
