import {
  createStore as createReduxStore,
  applyMiddleware,
  compose,
  Store
} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {
  useStore as _useStore,
  useSelector as _useSelector,
  useDispatch as _useDispatch
} from 'react-redux'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { map, distinctUntilChanged } from 'rxjs/operators'
import { message } from '@/_helpers/browser-api'

import {
  getRootReducer,
  StoreState,
  StoreAction,
  StoreDispatch
} from './modules'
import { init } from './init'
import { epics } from './epics'

const epicMiddleware = createEpicMiddleware<
  StoreAction,
  StoreAction,
  StoreState
>()

export const useStore: () => Store<StoreState, StoreAction> = _useStore

export const useSelector: <TSelected = unknown>(
  selector: (state: StoreState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => TSelected = _useSelector

export const useDispatch: () => StoreDispatch = _useDispatch

export const createStore = async () => {
  const composeEnhancers: typeof compose =
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createReduxStore(
    await getRootReducer(),
    composeEnhancers(applyMiddleware(thunkMiddleware, epicMiddleware))
  )

  epicMiddleware.run(epics)

  init(store.dispatch, store.getState)

  // sync state
  const storeState$ = new Observable<StoreState>(observer => {
    store.subscribe(() => observer.next(store.getState()))
  })

  storeState$
    .pipe(
      map(state => state.isPinned),
      distinctUntilChanged()
    )
    .subscribe(isPinned => {
      message.self.send({
        type: 'PIN_STATE',
        payload: isPinned
      })
    })

  message.addListener('QUERY_PIN_STATE', queryStoreState)
  message.self.addListener('QUERY_PIN_STATE', queryStoreState)

  async function queryStoreState() {
    return store.getState().isPinned
  }

  return store
}
