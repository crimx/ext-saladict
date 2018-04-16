import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'

import { listenConfig } from './modules/config'
import { listenSelection } from './modules/selection'

export default () => {
  const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
  )

  store.dispatch(listenConfig())
  store.dispatch(listenSelection())

  return store
}
