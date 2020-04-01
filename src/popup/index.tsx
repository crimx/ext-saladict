import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { AppConfig } from '@/app-config'
import { reportGA } from '@/_helpers/analytics'
import { getConfig } from '@/_helpers/config-manager'
import { message, openURL } from '@/_helpers/browser-api'
import { saveWord, Word } from '@/_helpers/record-manager'
import { translateCtxs, genCtxText } from '@/_helpers/translateCtx'
import { Message } from '@/typings/message'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { i18nLoader, I18nContextProvider } from '@/_helpers/i18n'

import Popup from './Popup'
import Notebook from './Notebook'
import './_style.scss'

getConfig().then(config => {
  document.body.style.width = config.panelWidth + 'px'

  switch (config.baOpen) {
    case 'popup_panel':
      showPanel(config)
      break
    case 'popup_fav':
      addNotebook()
      break
    case 'popup_options':
      openOptions()
      break
    case 'popup_standalone':
      message.send({ type: 'OPEN_QS_PANEL' })
      break
    default:
      sendContextMenusClick(config.baOpen)
      break
  }
})

async function showPanel(config: AppConfig) {
  if (config.analytics) {
    reportGA('/popup')
  }

  const store = createStore()
  await i18nLoader()

  ReactDOM.render(
    <ProviderRedux store={store}>
      <I18nContextProvider>
        <I18nContextProvider>
          <Popup config={config} />
        </I18nContextProvider>
      </I18nContextProvider>
    </ProviderRedux>,
    document.getElementById('root')
  )
}

async function addNotebook() {
  let hasError = false
  let word: Word | undefined

  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]
  if (tab && tab.id) {
    try {
      word = await message.send<'PRELOAD_SELECTION'>(tab.id, {
        type: 'PRELOAD_SELECTION'
      })
    } catch (err) {
      hasError = true
    }

    if (word && word.text) {
      try {
        await saveWord('notebook', word)
      } catch (err) {
        hasError = true
      }
    }
  } else {
    hasError = true
  }

  await i18nLoader()

  ReactDOM.render(
    <I18nContextProvider>
      <Notebook word={word} hasError={hasError} />
    </I18nContextProvider>,
    document.getElementById('root')
  )

  // async get translations
  if (word && word.context) {
    const config = await getConfig()
    word.trans = genCtxText(
      word.trans,
      await translateCtxs(word.context || word.title, config.ctxTrans)
    )
    try {
      await saveWord('notebook', word)
    } catch (err) {
      /* */
    }
  }
}

function openOptions() {
  openURL('options.html', true)
}

async function sendContextMenusClick(menuItemId: string) {
  const payload: Message<'CONTEXT_MENUS_CLICK'>['payload'] = {
    menuItemId
  }
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tab = tabs[0]
    if (tab && tab.url) {
      payload.linkUrl = tab.url
      if (tab.id) {
        try {
          const word = await message.send<'PRELOAD_SELECTION'>(tab.id, {
            type: 'PRELOAD_SELECTION'
          })
          if (word && word.text) {
            payload.selectionText = word.text
          }
        } catch (e) {
          /* */
        }
      }
    }
  } catch (e) {
    /* */
  }
  message.send({
    type: 'CONTEXT_MENUS_CLICK',
    payload
  })
}
