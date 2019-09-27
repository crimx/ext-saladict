import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { AppConfig } from '@/app-config'
import { injectAnalytics } from '@/_helpers/analytics'
import { getConfig } from '@/_helpers/config-manager'
import { message, openURL } from '@/_helpers/browser-api'
import { saveWord, Word } from '@/_helpers/record-manager'
import { translateCtx } from '@/_helpers/translateCtx'
import { Message } from '@/typings/message'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

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

function showPanel(config: AppConfig) {
  if (config.analytics) {
    injectAnalytics('/popup')
  }

  ReactDOM.render(
    <ProviderRedux store={createStore()}>
      <ProviderI18next i18n={i18nLoader()}>
        <Popup config={config} />
      </ProviderI18next>
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

  ReactDOM.render(
    <ProviderI18next i18n={i18nLoader()}>
      <Notebook word={word} hasError={hasError} />
    </ProviderI18next>,
    document.getElementById('root')
  )

  // async get translations
  if (word && word.context) {
    const config = await getConfig()
    word.trans = await translateCtx(word.context || word.title, config.ctxTrans)
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
