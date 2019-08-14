import { StoreActionCatalog, StoreAction } from '../modules'
import { ActionHandler } from '../utils/types'

export const createReducer = <C extends {}, S extends {}>(
  initialState: S,
  handlers: ActionHandler<C, S, StoreActionCatalog>
) =>
  function reducer(state = initialState, action: StoreAction): S {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }

export default createReducer
