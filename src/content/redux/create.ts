import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer, { StoreState } from './modules'

import { startUpAction as configStartUp, updateConfig } from './modules/config'
import { startUpAction as selectionStartUp } from './modules/selection'
import { startUpAction as widgetStartUp } from './modules/widget'
import { startUpAction as dictionariesStartUp } from './modules/dictionaries'

import { message } from '@/_helpers/browser-api'
import { MsgType, MsgIsPinned, MsgQueryPanelState } from '@/typings/message'
import { getConfig } from '@/_helpers/config-manager'
import { getActiveProfile } from '@/_helpers/profile-manager'

import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged'

import get from 'lodash/get'

export default () => {
  const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createStore<StoreState>(
    rootReducer as any,
    composeEnhancers(applyMiddleware(thunk))
  )

  Promise.all([getConfig(), getActiveProfile()]).then(([config, profile]) => {
    store.dispatch<any>(updateConfig({ ...config, ...profile }))
    store.dispatch<any>(configStartUp())
    store.dispatch<any>(selectionStartUp())
    store.dispatch<any>(widgetStartUp())
    store.dispatch<any>(dictionariesStartUp())
  })

  // sync state
  const storeState$ = new Observable<StoreState>(observer => {
    store.subscribe(() => observer.next(store.getState()))
  })

  storeState$.pipe(
    map(state => state.widget.isPinned),
    distinctUntilChanged()
  ).subscribe(isPinned => {
    message.self.send<MsgIsPinned>({
      type: MsgType.IsPinned,
      isPinned,
    })
  })

  message.addListener<MsgQueryPanelState>(MsgType.QueryPanelState, queryStoreState)
  message.self.addListener<MsgQueryPanelState>(MsgType.QueryPanelState, queryStoreState)

  function queryStoreState ({ path }: MsgQueryPanelState) {
    return Promise.resolve(path && typeof path === 'string'
      ? get(store.getState(), path)
      : store.getState()
    )
  }

  return store
}
