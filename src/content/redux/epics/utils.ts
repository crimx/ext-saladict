import { Observable } from 'rxjs'
import { Epic as RawEpic, ofType as rawOfType } from 'redux-observable'
import { StoreAction, StoreActionType, StoreState } from '../modules'

/** Tailored `Epic` for the store. */
export type Epic<
  TOutType extends StoreActionType = StoreActionType,
  TDeps = any
> = RawEpic<StoreAction, StoreAction<TOutType>, StoreState, TDeps>

/**
 * Tailored `ofType` for the store.
 * Now you can use `ofType` directly without the need to
 * manually offer types each time.
 */
export const ofType = rawOfType as <
  TInAction extends StoreAction,
  TTypes extends StoreActionType[] = StoreActionType[],
  TOutAction extends StoreAction = StoreAction<TTypes[number]>
>(
  ...types: TTypes
) => (source: Observable<TInAction>) => Observable<TOutAction>
