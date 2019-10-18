import React, { FC, useState, useEffect } from 'react'
import App from './App'
import 'antd/dist/antd.css'

import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import { i18nLoader } from '@/_helpers/i18n'

import { ConfigProvider as ProviderAntdConfig } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import { DBArea } from '@/_helpers/record-manager'
import { createConfigStream } from '@/_helpers/config-manager'
import { injectAnalytics } from '@/_helpers/analytics'

const i18n = i18nLoader()
i18n.loadNamespaces(['common', 'wordpage', 'content'])
i18n.setDefaultNamespace('wordpage')

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
        injectAnalytics(`/wordpage/${props.area}`)
      }
    })
  }, [])

  return (
    <ProviderI18next i18n={i18n}>
      <ProviderAntdConfig locale={antdLocales[locale]}>
        <App area={props.area} locale={locale} />
      </ProviderAntdConfig>
      <ProviderRedux store={reduxStore}>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ProviderRedux>
    </ProviderI18next>
  )
}

export default WordPage
