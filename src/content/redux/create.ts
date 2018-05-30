import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'

import { startUpAction as configStartUp } from './modules/config'
import { startUpAction as selectionStartUp } from './modules/selection'
import { startUpAction as widgetStartUp } from './modules/widget'
import { startUpAction as dictionariesStartUp } from './modules/dictionaries'

export default () => {
  const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

  const store = createStore(
    rootReducer as any,
    composeEnhancers(applyMiddleware(thunk))
  )

  store.dispatch<any>(configStartUp())
  store.dispatch<any>(selectionStartUp())
  store.dispatch<any>(widgetStartUp())
  store.dispatch<any>(dictionariesStartUp())

  return store
}
