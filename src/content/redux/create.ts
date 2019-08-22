import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { map, distinctUntilChanged } from 'rxjs/operators'

import get from 'lodash/get'

import { message } from '@/_helpers/browser-api'
import { getConfig } from '@/_helpers/config-manager'
import { getActiveProfile } from '@/_helpers/profile-manager'

import { rootReducer, StoreState, StoreAction } from './modules'
import { init } from './modules/init'
import { epics } from './modules/epics'

const epicMiddleware = createEpicMiddleware<
  StoreAction,
  StoreAction,
  StoreState
>()

export default () => {
  const composeEnhancers: typeof compose =
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createStore(
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

  message.addListener('QUERY_PANEL_STATE', queryStoreState)
  message.self.addListener('QUERY_PANEL_STATE', queryStoreState)

  function queryStoreState({ payload: path }: { payload?: string }) {
    return Promise.resolve(
      path && typeof path === 'string'
        ? get(store.getState(), path)
        : store.getState()
    )
  }

  return store
}
