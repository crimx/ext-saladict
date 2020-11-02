import './env'
import '@/selection'

import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
import { AppConfig } from '@/app-config'
import { reportPaveview } from '@/_helpers/analytics'
import { getConfig } from '@/_helpers/config-manager'
import { message, openUrl } from '@/_helpers/browser-api'
import { saveWord, Word } from '@/_helpers/record-manager'
import { translateCtxs, genCtxText } from '@/_helpers/translateCtx'
import { Message } from '@/typings/message'

import { Provider as ProviderRedux } from 'react-redux'
import { createStore } from '@/content/redux'

import { I18nContextProvider, useTranslate } from '@/_helpers/i18n'

import Popup from './Popup'
import Notebook from './Notebook'
import './_style.scss'

// This is a workaround for browser action page
// which does not fire beforeunload event
browser.runtime.connect({ name: 'popup' } as any) // wrong typing

const Title: FC = () => {
  const { t } = useTranslate('popup')
  return (
    <Helmet>
      <title>{t('title')}</title>
    </Helmet>
  )
}

getConfig().then(config => {
  document.body.style.width =
    config.baOpen === 'popup_panel'
      ? (config.baWidth >= 0 ? config.baWidth : config.panelWidth) + 'px'
      : '450px'

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
      sendContextMenusClick(config.baOpen).then(() => {
        window.close()
      })
      break
  }
})

async function showPanel(config: AppConfig) {
  if (config.analytics) {
    reportPaveview('/popup')
  }

  const store = await createStore()

  ReactDOM.render(
    <I18nContextProvider>
      <Title />
      <ProviderRedux store={store}>
        <Popup config={config} />
      </ProviderRedux>
    </I18nContextProvider>,
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
  openUrl('options.html', true)
}

async function sendContextMenusClick(menuItemId: string) {
  const payload: Message<'CONTEXT_MENUS_CLICK'>['payload'] = {
    menuItemId
  }

  const tabs = await browser.tabs
    .query({ active: true, currentWindow: true })
    .catch((): browser.tabs.Tab[] => [])

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
        console.error(e)
      }
    }
  }

  await message.send({
    type: 'CONTEXT_MENUS_CLICK',
    payload
  })
}
