import React from 'react'
import ReactDOM from 'react-dom'

import { Provider as ProviderRedux } from 'react-redux'
import SaladBowlContainer from './containers/SaladBowlContainer'
import DictPanelContainer from './containers/DictPanelContainer'
import WordEditorContainer from './containers/WordEditorContainer'
import createStore from './redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18n from './i18n'

import './content.scss'

const store = createStore()

const App = () => (
  <ProviderRedux store={store}>
  <ProviderI18next i18n={i18n}>
    <div>
      <SaladBowlContainer />
      <DictPanelContainer />
      <WordEditorContainer />
    </div>
  </ProviderI18next>
  </ProviderRedux>
)

ReactDOM.render(<App />, document.createElement('div'))
