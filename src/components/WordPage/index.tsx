import React from 'react'
import App from './App'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import worPageLocales from '@/_locales/wordpage'
import contentLocales from '@/_locales/content'

import { LocaleProvider as ProviderAntdLocale } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import { Area } from '@/_helpers/record-manager'
import { createConfigStream } from '@/_helpers/config-manager'

const i18n = i18nLoader({ wordpage: worPageLocales, content: contentLocales }, 'wordpage')
const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US,
}

export interface WordPageProps {
  area: Area
}

export interface WordPageState {
  locale: string
}

export default class WordPage extends React.Component<WordPageProps, WordPageState> {
  state: WordPageState = {
    locale: 'zh-CN'
  }

  componentDidMount () {
    createConfigStream().subscribe(config => {
      if (this.state.locale !== config.langCode && antdLocales[config.langCode]) {
        this.setState({ locale: config.langCode })
      }
    })
  }

  render () {
    return (
      <ProviderI18next i18n={i18n}>
        <ProviderAntdLocale locale={antdLocales[this.state.locale]}>
          <App area={this.props.area} locale={this.state.locale} />
        </ProviderAntdLocale>
      </ ProviderI18next>
    )
  }
}
