import {
  createStore as createReduxStore,
  applyMiddleware,
  compose,
  Store
} from 'redux'
import { useStore as _useStore } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { getRootReducer, StoreState, StoreAction } from './modules'
import { init } from './init'

export const createStore = async () => {
  const composeEnhancers: typeof compose =
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createReduxStore(
    await getRootReducer(),
    composeEnhancers(applyMiddleware(thunkMiddleware))
  )

  init(store.dispatch, store.getState)

  return store
}

export const useStore: () => Store<StoreState, StoreAction> = _useStore

export default createStore
