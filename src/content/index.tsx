import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as ProviderRedux } from 'react-redux'
import SaladBowlContainer from './components/SaladBowl/SaladBowl.container'
import DictPanelContainer from './components/DictPanel/DictPanel.container'
import createStore from './redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

// Only load on top frame
if (window.parent === window && !window.__SALADICT_PANEL_LOADED__) {
  window.__SALADICT_PANEL_LOADED__ = true

  const i18n = i18nLoader()
  const store = createStore()

  const App = () => (
    <ProviderRedux store={store}>
      <ProviderI18next i18n={i18n}>
        <SaladBowlContainer />
        <DictPanelContainer />
      </ProviderI18next>
    </ProviderRedux>
  )

  ReactDOM.render(<App />, document.createElement('div'))
}
