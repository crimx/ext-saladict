import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Epic as EpicTemplate } from 'redux-observable'
import { Action } from './types'
import {
  StoreActionCatalog,
  StoreActionType,
  StoreAction,
  StoreState
} from '../modules'

export type Epic = EpicTemplate<StoreAction, StoreAction, StoreState>

/** Tailored epic ofType */
export function ofType<T extends StoreActionType>(
  ...keys: Array<T>
): (
  source: Observable<StoreAction>
) => Observable<Action<StoreActionCatalog, T>>
export function ofType<T extends StoreActionType>(
  ...keys: Array<{ toString: () => T }>
): (
  source: Observable<StoreAction>
) => Observable<Action<StoreActionCatalog, T>>
export function ofType<T extends StoreActionType>(
  ...keys: Array<T | { toString: () => T }>
): (
  source: Observable<StoreAction>
) => Observable<Action<StoreActionCatalog, T>>
export function ofType<T extends StoreActionType>(
  ...keys: Array<T | { toString: () => T }>
) {
  return (source: Observable<StoreAction>) =>
    // function type coercion
    // eslint-disable-next-line eqeqeq
    filter<StoreAction>(({ type }) => keys.some(key => type == key))(source)
}
