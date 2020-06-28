import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { AntdRoot, switchAntdTheme } from '@/components/AntdRoot'
import { MainEntry } from './components/MainEntry'
import createStore from './redux/create'

import './_style.scss'

document.title = 'Saladict Options'

createStore().then(async store => {
  let { darkMode } = store.getState().config
  await switchAntdTheme(darkMode)

  store.subscribe(() => {
    const { config } = store.getState()
    if (config.darkMode !== darkMode) {
      darkMode = config.darkMode
      switchAntdTheme(darkMode)
    }
  })

  ReactDOM.render(
    <AntdRoot>
      <Provider store={store}>
        <MainEntry />
      </Provider>
    </AntdRoot>,
    document.getElementById('root')
  )
})
