import React from 'react'
import ReactDOM from 'react-dom'
import Popup from './Popup'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'
import { injectAnalytics } from '@/_helpers/analytics'
import { AppConfig } from '@/app-config'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { message, openURL } from '@/_helpers/browser-api'
import { MsgContextMenusClick, MsgType } from '@/typings/message'
import { Mutable } from '@/typings/helpers'
import { SelectionInfo } from '@/_helpers/selection'
import { saveWord } from '@/_helpers/record-manager'
import Notebook from './Notebook'
import { translateCtx } from '@/_helpers/translateCtx'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import popupLocles from '@/_locales/popup'

import './_style.scss'

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

  componentDidMount () {
    addConfigListener(({ newConfig }) => {
      document.body.style.width = newConfig.panelWidth + 'px'
      this.setState({ config: newConfig })
    })
  }

  render () {
    return (
      <ProviderI18next i18n={this.props.i18n}>
        <Popup config={this.state.config} />
      </ ProviderI18next>
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

function showPanel (config: AppConfig) {
  document.body.classList.add('panel')
  injectSaladictInternal(true)

  if (config.analytics) {
    injectAnalytics('/popup')
  }

  const i18n = i18nLoader({ popup: popupLocles }, 'popup')
  ReactDOM.render(
    <App config={config} i18n={i18n} />,
    document.getElementById('root'),
  )
}

async function addNotebook () {
  let hasError = false
  let info: Mutable<SelectionInfo> | undefined

  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]
  if (tab && tab.id) {
    try {
      info = await message.send(
        tab.id,
        { type: MsgType.PreloadSelection }
      )
    } catch (err) {
      hasError = true
    }

    if (info && info.text) {
      try {
        await saveWord('notebook', info)
      } catch (err) {
        hasError = true
      }
    }
  } else {
    hasError = true
  }

  const i18n = i18nLoader({ popup: popupLocles }, 'popup')
  ReactDOM.render(
    <ProviderI18next i18n={i18n}>
      <Notebook info={info} hasError={hasError}/>
    </ ProviderI18next>,
    document.getElementById('root'),
  )

  // async get translations
  if (info && info.context) {
    const config = await getConfig()
    info.trans = await translateCtx(info.context || info.title, config.ctxTrans)
    try {
      await saveWord('notebook', info)
    } catch (err) {/* */}
  }
}

function openOptions () {
  openURL('options.html', true)
}

async function sendContextMenusClick (menuItemId: string) {
  const msg: Mutable<MsgContextMenusClick> = {
    type: MsgType.ContextMenusClick,
    menuItemId,
  }
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tab = tabs[0]
    if (tab && tab.url) {
      msg.linkUrl = tab.url
      if (tab.id) {
        try {
          const info: SelectionInfo = await message.send(
            tab.id,
            { type: MsgType.PreloadSelection }
          )
          if (info && info.text) {
            msg.selectionText = info.text
          }
        } catch (e) {/* */}
      }
    }
  } catch (e) {/* */}
  message.send(msg)
}
