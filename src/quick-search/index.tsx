import './env'

import React from 'react'
import ReactDOM from 'react-dom'
import { message } from '@/_helpers/browser-api'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

import { DictPanelStandaloneContainer } from '@/content/components/DictPanel/DictPanelStandalone.container'

import './quick-search.scss'

ReactDOM.render(
  <ProviderRedux store={createStore()}>
    <ProviderI18next i18n={i18nLoader()}>
      <DictPanelStandaloneContainer width="100%" height="100%" />
    </ProviderI18next>
  </ProviderRedux>,
  document.getElementById('root')
)

window.addEventListener('unload', () => {
  message.send({ type: 'CLOSE_QS_PANEL' })
})
