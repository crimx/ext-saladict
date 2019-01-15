import React from 'react'
import ReactDOM from 'react-dom'
import Popup from './Popup'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import popupLocles from '@/_locales/popup'

import './_style.scss'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_POPUP_PAGE__ = true
injectSaladictInternal(true) // inject panel AFTER flags are set

const i18n = i18nLoader({ popup: popupLocles }, 'popup')

ReactDOM.render(
  <ProviderI18next i18n={i18n}>
    <Popup />
  </ ProviderI18next>,
  document.getElementById('root'),
)
