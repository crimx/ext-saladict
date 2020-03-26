import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as ProviderRedux } from 'react-redux'
import SaladBowlContainer from './components/SaladBowl/SaladBowl.container'
import DictPanelContainer from './components/DictPanel/DictPanel.container'
import WordEditorContainer from './components/WordEditor/WordEditor.container'
import createStore from './redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

import './content.scss'

// Only load on top frame
if (window.parent === window && !window.__SALADICT_PANEL_LOADED__) {
  window.__SALADICT_PANEL_LOADED__ = true

  const App = () => (
    <ProviderRedux store={createStore()}>
      <ProviderI18next i18n={i18nLoader()}>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ProviderI18next>
    </ProviderRedux>
  )

  ReactDOM.render(<App />, document.createElement('div'))
}
