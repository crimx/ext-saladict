import React, { FC, useContext, useEffect } from 'react'
import {
  I18nContextProvider,
  I18nContext,
  i18nLoader
} from '../../src/_helpers/i18n'
import i18next from 'i18next'

interface I18nWrapProps {
  lang: string
}

const I18nWrapInner: FC<I18nWrapProps> = props => {
  const lang = useContext(I18nContext)
  useEffect(() => {
    if (lang) {
      if (lang && props.lang !== lang) {
        i18next.changeLanguage(props.lang)
      }
    } else {
      i18nLoader()
    }
  }, [lang, props.lang])
  return <>{props.children}</>
}

const I18nWrap: FC<I18nWrapProps> = props => (
  <I18nContextProvider>
    <I18nWrapInner {...props}>{props.children}</I18nWrapInner>
  </I18nContextProvider>
)

export const i18nContexts = [
  {
    // https://storybooks-official.netlify.com/?path=/story/basics-icon--labels
    icon: 'globe',
    title: 'i18n',
    components: [I18nWrap],
    params: [
      {
        name: 'English',
        props: { lang: 'en' },
        default: 'en' === navigator.language
      },
      {
        name: '简体中文',
        props: { lang: 'zh-CN' },
        default: 'zh-CN' === navigator.language
      },
      {
        name: '繁体中文',
        props: { lang: 'zh-TW' },
        default: 'zh-TW' === navigator.language
      }
    ]
  }
]
