import { AddonSetting } from '@storybook/addon-contexts/dist/shared/types'
import React from 'react'
import { i18nLoader } from '../../src/_helpers/i18n'

const i18n = i18nLoader()

// add to story
// import { withContexts } from '@storybook/addon-contexts/react'
// import { contexts } from '...../configs/contexts'
// .addDecorator(withContexts(contexts))

const I18nWrap = props => {
  if (props.lang !== i18n.language) {
    i18n.changeLanguage(props.lang)
  }
  return <div lang={props.lang}>{props.children}</div>
}

export const i18nContexts: AddonSetting[] = [
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
