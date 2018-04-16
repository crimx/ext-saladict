import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import SaladBowlContainer from './containers/SaladBowlContainer'
import createStore from './redux/create'

import './content.scss'

const store = createStore()

const App = () => (
  <Provider store={store}>
    <SaladBowlContainer />
  </Provider>
)

ReactDOM.render(<App />, document.createElement('div'))
