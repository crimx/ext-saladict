import {
  createStore as createReduxStore,
  applyMiddleware,
  compose
} from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { map, distinctUntilChanged } from 'rxjs/operators'

import { message } from '@/_helpers/browser-api'
import { getConfig } from '@/_helpers/config-manager'
import { getActiveProfile } from '@/_helpers/profile-manager'

import { rootReducer, StoreState, StoreAction } from './modules'
import { init } from './init'
import { epics } from './epics'

const epicMiddleware = createEpicMiddleware<
  StoreAction,
  StoreAction,
  StoreState
>()

export const createStore = () => {
  const composeEnhancers: typeof compose =
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createReduxStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunkMiddleware, epicMiddleware))
  )

  epicMiddleware.run(epics)

  Promise.all([getConfig(), getActiveProfile()]).then(([config, profile]) => {
    store.dispatch({ type: 'NEW_CONFIG', payload: config })
    store.dispatch({ type: 'NEW_ACTIVE_PROFILE', payload: profile })
    init(store.dispatch, store.getState)
  })

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

export default createStore
