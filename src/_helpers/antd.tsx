import React, { FC, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Provider as ProviderRedux } from 'react-redux'
import createStore from '@/content/redux/create'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import { I18nContextProvider, Namespace, useTranslate } from '@/_helpers/i18n'

import { ConfigProvider as AntdConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import { createConfigStream } from '@/_helpers/config-manager'
import { reportGA } from '@/_helpers/analytics'

import 'antd/dist/antd.css'
import { useRefFn } from 'observable-hooks'

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US
}

const darkTheme =
  process.env.NODE_ENV === 'development'
    ? `https://cdnjs.cloudflare.com/ajax/libs/antd/4.1.0/antd.dark.min.css`
    : `/assets/antd.dark.min.css`

interface AntdTitleProps {
  darkMode: boolean
  /** i18n key */
  titleKey: string
  /** i18n namespace */
  titleNS: Namespace
}

const AntdTitle: FC<AntdTitleProps> = props => {
  const { t } = useTranslate(props.titleNS)
  return (
    <Helmet>
      <title>{t(props.titleKey)}</title>
      {props.darkMode && <link rel="stylesheet" href={darkTheme} />}
    </Helmet>
  )
}

export interface AntdRootProps {
  /** analytics path */
  path: string
  /** i18n key */
  titleKey: string
  /** i18n namespace */
  titleNS: Namespace
}

export const AntdRoot: FC<AntdRootProps> = props => {
  const storeRef = useRefFn(createStore)

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

  return (
    <I18nContextProvider>
      <AntdTitle
        titleKey={props.titleKey}
        titleNS={props.titleNS}
        darkMode={darkMode}
      />
      <AntdConfigProvider locale={antdLocales[locale]}>
        {props.children}
      </AntdConfigProvider>
      <ProviderRedux store={storeRef.current}>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ProviderRedux>
    </I18nContextProvider>
  )
}
