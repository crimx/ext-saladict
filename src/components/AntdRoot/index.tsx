import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import ReactDOM from 'react-dom'
import { createStore } from '@/content/redux'
import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'
import { I18nContextProvider } from '@/_helpers/i18n'
import { timer } from '@/_helpers/promise-more'
import { AntdRootContainer } from './AntdRootContainer'

import './_style.scss'

export const initAntdRoot = async (
  render: () => React.ReactNode,
  gaPath?: string
): Promise<void> => {
  const store = await createStore()

  // update theme as quickly as possible
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
    <I18nContextProvider>
      <ReduxProvider store={store}>
        <AntdRootContainer gaPath={gaPath} render={render} />
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ReduxProvider>
    </I18nContextProvider>,
    document.getElementById('root')
  )
}

async function switchAntdTheme(darkMode: boolean): Promise<void> {
  const $root = document.querySelector('#root')!

  await new Promise(resolve => {
    const filename = `antd${darkMode ? '.dark' : ''}.min.css`
    const href =
      process.env.NODE_ENV === 'development'
        ? `https://cdnjs.cloudflare.com/ajax/libs/antd/4.1.0/${filename}`
        : `/assets/${filename}`
    let $link = document.head.querySelector<HTMLLinkElement>(
      'link#saladict-antd-theme'
    )

    if ($link && $link.getAttribute('href') === href) {
      resolve()
      return
    }

    // smooth dark/bright transition
    $root.classList.toggle('saladict-theme-dark', darkMode)
    $root.classList.toggle('saladict-theme-bright', !darkMode)
    $root.classList.toggle('saladict-theme-loading', true)

    if ($link) {
      $link.setAttribute('href', href)
    } else {
      $link = document.createElement('link')
      $link.setAttribute('id', 'saladict-antd-theme')
      $link.setAttribute('rel', 'stylesheet')
      $link.setAttribute('href', href)
      document.head.insertBefore($link, document.head.firstChild)
    }

    let loaded = false

    // @ts-ignore
    $link.onreadystatechange = function() {
      // @ts-ignore
      if (this.readyState === 'complete' || this.readyState === 'loaded') {
        if (loaded === false) {
          resolve()
        }
        loaded = true
      }
    }

    $link.onload = function() {
      if (loaded === false) {
        resolve()
      }
      loaded = true
    }

    const img = document.createElement('img')
    img.onerror = function() {
      if (loaded === false) {
        resolve()
      }
      loaded = true
    }
    img.src = href
  })

  await timer(500)

  $root.classList.toggle('saladict-theme-loaded', true)
  $root.classList.toggle('saladict-theme-loading', false)
}
