import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { StoreActionCatalog, StoreActionType, StoreAction } from '../modules'
import { Action } from './types'

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
) {
  return (source: Observable<StoreAction>) =>
    filter<StoreAction>(({ type }) => keys.some(key => type == key))(source)
}
