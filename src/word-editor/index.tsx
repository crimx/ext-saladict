import './env'

import React from 'react'
import ReactDOM from 'react-dom'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { i18nLoader, I18nContextProvider } from '@/_helpers/i18n'

import { WordEditorStandaloneContainer } from '@/content/components/WordEditor/WordEditorStandalone.container'

import './word-editor.scss'

document.title = 'Saladict Word Editor'

main()

async function main() {
  const store = createStore()
  await i18nLoader()

  const searchParams = new URL(document.URL).searchParams

  const wordString = searchParams.get('word')
  if (wordString) {
    try {
      const word = JSON.parse(decodeURIComponent(wordString))
      if (word) {
        store.dispatch({ type: 'WORD_EDITOR_STATUS', payload: { word } })
      }
    } catch (e) {
      console.warn(e)
    }
  }

  ReactDOM.render(
    <ProviderRedux store={store}>
      <I18nContextProvider>
        <WordEditorStandaloneContainer />
      </I18nContextProvider>
    </ProviderRedux>,
    document.getElementById('root')
  )
}
