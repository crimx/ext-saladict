import './env'

import React from 'react'
import ReactDOM from 'react-dom'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

import { WordEditorStandaloneContainer } from '@/content/components/WordEditor/WordEditorStandalone.container'

import './word-editor.scss'

document.title = 'Saladict Word Editor'

const store = createStore()
const i18n = i18nLoader()

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
    <ProviderI18next i18n={i18n}>
      <WordEditorStandaloneContainer />
    </ProviderI18next>
  </ProviderRedux>,
  document.getElementById('root')
)
