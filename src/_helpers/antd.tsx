import React, { FC, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import { i18nLoader, I18nContextProvider } from '@/_helpers/i18n'

import { ConfigProvider as AntdConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import { createConfigStream } from '@/_helpers/config-manager'
import { reportGA } from '@/_helpers/analytics'

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US
}

export interface LocaledRoot {
  /** analytics path */
  path: string
  title: string
}

export async function getLocaledRoot() {
  const reduxStore = createStore()
  await i18nLoader()

  const LocaledRoot: FC<LocaledRoot> = props => {
    const [locale, setLocale] = useState('zh-CN')
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
      createConfigStream().subscribe(config => {
        if (locale !== config.langCode && antdLocales[config.langCode]) {
          setLocale(config.langCode)
        }

        if (darkMode !== config.darkMode) {
          setDarkMode(config.darkMode)
        }

        if (config.analytics) {
          reportGA(props.path)
        }
      })
    }, [])

    const theme =
      process.env.NODE_ENV === 'development'
        ? `https://cdnjs.cloudflare.com/ajax/libs/antd/4.1.0/antd${
            darkMode ? '.dark' : ''
          }.min.css`
        : `/assets/antd${darkMode ? '.dark' : ''}.min.css`

    return (
      <I18nContextProvider>
        <Helmet>
          <title>{props.title}</title>
          <link rel="stylesheet" href={theme} />
        </Helmet>
        <AntdConfigProvider locale={antdLocales[locale]}>
          {props.children}
        </AntdConfigProvider>
        <ProviderRedux store={reduxStore}>
          <SaladBowlContainer />
          <DictPanelContainer />
          <WordEditorContainer />
        </ProviderRedux>
      </I18nContextProvider>
    )
  }

  return LocaledRoot
}
