import { StoreAction } from '../modules'
import { Payload, ActionHandler } from '../utils/types'

export const createReducer = <P = Payload, S = {}>(
  initialState: S,
  handlers: ActionHandler<P, S>
) =>
  function reducer(state = initialState, action: StoreAction): S {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }

export default createReducer
