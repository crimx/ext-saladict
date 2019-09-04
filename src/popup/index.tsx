import React from 'react'
import ReactDOM from 'react-dom'
import Popup from './Popup'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'
import { injectAnalytics } from '@/_helpers/analytics'
import { AppConfig } from '@/app-config'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { message, openURL } from '@/_helpers/browser-api'
import { saveWord, Word } from '@/_helpers/record-manager'
import Notebook from './Notebook'
import { translateCtx } from '@/_helpers/translateCtx'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

import './_style.scss'
import { Message } from '@/typings/message'

// inject panel AFTER flags are set
window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_POPUP_PAGE__ = true

interface AppProps {
  i18n: ReturnType<typeof i18nLoader>
  config: AppConfig
}

interface AppState {
  config: AppConfig
}

class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    config: this.props.config
  }

  componentDidMount() {
    addConfigListener(({ newConfig }) => {
      document.body.style.width = newConfig.panelWidth + 'px'
      this.setState({ config: newConfig })
    })
  }

  render() {
    return (
      <ProviderI18next i18n={this.props.i18n}>
        <Popup config={this.state.config} />
      </ProviderI18next>
    )
  }
}

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
    default:
      sendContextMenusClick(config.baOpen)
      break
  }
})

function showPanel(config: AppConfig) {
  document.body.classList.add('panel')
  injectSaladictInternal(true)

  if (config.analytics) {
    injectAnalytics('/popup')
  }

  const i18n = i18nLoader()
  i18n.loadNamespaces('popup')
  i18n.setDefaultNamespace('popup')

  ReactDOM.render(
    <App config={config} i18n={i18n} />,
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

  const i18n = i18nLoader()
  i18n.loadNamespaces('popup')
  i18n.setDefaultNamespace('popup')

  ReactDOM.render(
    <ProviderI18next i18n={i18n}>
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
