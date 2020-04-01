import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { message } from '@/_helpers/browser-api'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { i18nLoader, I18nContextProvider } from '@/_helpers/i18n'

import { DictPanelStandaloneContainer } from '@/content/components/DictPanel/DictPanelStandalone.container'

import './quick-search.scss'

document.title = 'Saladict Dict Panel'

main()

async function main() {
  const store = createStore()
  await i18nLoader()

  ReactDOM.render(
    <ProviderRedux store={store}>
      <I18nContextProvider>
        <DictPanelStandaloneContainer width="100vw" height="100vh" />
      </I18nContextProvider>
    </ProviderRedux>,
    document.getElementById('root')
  )

  window.addEventListener('unload', () => {
    message.send({ type: 'CLOSE_QS_PANEL' })
  })
}
