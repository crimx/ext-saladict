/**
 * Env for dev dicts
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { appConfigFactory, DictID } from '@/app-config'

import { I18nextProvider as ProviderI18next, translate } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import dictsLocles from '@/_locales/dicts'
import contentLocles from '@/_locales/content'
import profileLocles from '@/_locales/config-profiles'
import langcodeLocles from '@/_locales/langcode'
import { TranslationFunction } from 'i18next'

import '@/panel/panel.scss'

const i18n = i18nLoader({
  content: contentLocles,
  dict: dictsLocles,
  profile: profileLocles,
  langcode: langcodeLocles,
}, 'content')

window['FAKE_AJAX_DELAY'] = 0

const config = appConfigFactory()

const root = document.getElementById('root') as HTMLDivElement
document.body.style.justifyContent = 'center'
document.body.style.margin = '0 auto'
document.body.style.width = config.panelWidth + 'px'
document.body.style.background = '#ccc'
root.style.background = '#fff'
root.style.overflowY = 'scroll'

interface EnvConfig {
  dict: DictID
  style?: boolean
  text?: string
}

export default function setupEnv ({ dict, style = true, text = 'salad' }: EnvConfig) {
  const search = require('../dictionaries/' + dict + '/engine').default
  const View = translate()(require('../dictionaries/' + dict + '/View').default)

  if (style) {
    require('../dictionaries/' + dict + '/_style.scss')
  }

  search(text, appConfigFactory())
    .then(result => {
      ReactDOM.render(
        <ProviderI18next i18n={i18n}>
        <div className='panel-DictItem'>
          <header className='panel-DictItem_Header'>
            <img className='panel-DictItem_Logo' src={require('@/components/dictionaries/' + dict + '/favicon.png')} alt='dict logo' />
            <h1 className='panel-DictItem_Title'>{dict}</h1>
            <button className='panel-DictItem_FoldArrowBtn'>
              <svg className='panel-DictItem_FoldArrow isActive' width='18' height='18' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                <path d='M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58' />
              </svg>
            </button>
          </header>
          <div className='panel-DictItem_Body' style={{ fontSize: config.fontSize }}>
            <article className='panel-DictItem_BodyMesure'>
              <View {...result} />
            </article>
          </div>
        </div>
        </ProviderI18next>,
        root,
      )
    })
}
