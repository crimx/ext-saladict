import React, { FC, useState, useEffect } from 'react'
import App from './App'
import 'antd/dist/antd.css'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import i18next from 'i18next'
import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader, I18nContextProvider } from '@/_helpers/i18n'

import { ConfigProvider as ProviderAntdConfig } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import { DBArea } from '@/_helpers/record-manager'
import { createConfigStream } from '@/_helpers/config-manager'
import { reportGA } from '@/_helpers/analytics'

const reduxStore = createStore()

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US
}

export interface WordPageProps {
  area: DBArea
}

export const WordPage: FC<WordPageProps> = props => {
  const [locale, setLocale] = useState('zh-CN')

  useEffect(() => {
    createConfigStream().subscribe(config => {
      if (locale !== config.langCode && antdLocales[config.langCode]) {
        setLocale(config.langCode)
      }
      if (config.analytics) {
        reportGA(`/wordpage/${props.area}`)
      }
    })
  }, [])

  return (
    <I18nContextProvider>
      <ProviderI18next i18n={i18next}>
        <ProviderAntdConfig locale={antdLocales[locale]}>
          <App area={props.area} locale={locale} />
        </ProviderAntdConfig>
      </ProviderI18next>
      <ProviderRedux store={reduxStore}>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ProviderRedux>
    </I18nContextProvider>
  )
}

export default WordPage

export async function getLocaledWordPage(area: DBArea) {
  const i18n = await i18nLoader()
  i18n.loadNamespaces(['common', 'wordpage', 'content'])
  i18n.setDefaultNamespace('wordpage')

  return (
    <I18nContextProvider>
      <WordPage area={area} />
    </I18nContextProvider>
  )
}
