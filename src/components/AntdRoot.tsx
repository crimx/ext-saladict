import React, { FC, useState, useLayoutEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Provider as ReduxProvider } from 'react-redux'
import createStore from '@/content/redux/create'
import { useRefFn } from 'observable-hooks'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import { createConfigStream } from '@/_helpers/config-manager'
import { reportGA } from '@/_helpers/analytics'
import { I18nContextProvider } from '@/_helpers/i18n'

import { ConfigProvider as AntdConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import 'antd/dist/antd.css'

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US
}

const darkTheme =
  process.env.NODE_ENV === 'development'
    ? `https://cdnjs.cloudflare.com/ajax/libs/antd/4.1.0/antd.dark.min.css`
    : `/assets/antd.dark.min.css`

export interface AntdRootProps {
  /** analytics path */
  path?: string
}

export const AntdRoot: FC<AntdRootProps> = props => {
  const storeRef = useRefFn(createStore)

  const [locale, setLocale] = useState('zh-CN')
  const [darkMode, setDarkMode] = useState(false)

  useLayoutEffect(() => {
    createConfigStream().subscribe(config => {
      if (locale !== config.langCode && antdLocales[config.langCode]) {
        setLocale(config.langCode)
      }

      if (darkMode !== config.darkMode) {
        setDarkMode(config.darkMode)
      }

      if (config.analytics && props.path) {
        reportGA(props.path)
      }
    })
  }, [])

  return (
    <I18nContextProvider>
      {darkMode && (
        <Helmet>{<link rel="stylesheet" href={darkTheme} />}</Helmet>
      )}
      <ReduxProvider store={storeRef.current}>
        <AntdConfigProvider locale={antdLocales[locale]}>
          {props.children}
        </AntdConfigProvider>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ReduxProvider>
    </I18nContextProvider>
  )
}
