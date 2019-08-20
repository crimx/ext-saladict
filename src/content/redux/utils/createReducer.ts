import { StoreActionCatalog, StoreAction } from '../modules'
import { ActionHandlers } from '../utils/types'

export const createReducer = <S extends {}, C extends {}>(
  initialState: S,
  handlers: ActionHandlers<C, S, StoreActionCatalog>
) =>
  function reducer(state = initialState, action: StoreAction): S {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }

export default createReducer
