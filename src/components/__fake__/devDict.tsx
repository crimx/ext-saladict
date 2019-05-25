/**
 * Env for dev dicts
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { getDefaultConfig, DictID, AppConfigMutable } from '@/app-config'
import getDefaultProfile, { ProfileMutable, Profile } from '@/app-config/profiles'

import { I18nextProvider as ProviderI18next, translate } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import dictsLocles from '@/_locales/dicts'
import contentLocles from '@/_locales/content'
import profileLocles from '@/_locales/config-profiles'
import langcodeLocles from '@/_locales/langcode'

import '@/panel/index.scss'

const i18n = i18nLoader({
  content: contentLocles,
  dict: dictsLocles,
  profile: profileLocles,
  langcode: langcodeLocles,
}, 'content')

window['FAKE_AJAX_DELAY'] = 0

const config = getDefaultConfig()

const root = document.getElementById('root') as HTMLDivElement
document.body.style.justifyContent = 'center'
document.body.style.margin = '0 auto'
document.body.style.width = config.panelWidth + 'px'
document.body.style.background = '#ccc'
root.style.background = '#fff'
root.style.overflowY = 'scroll'

interface EnvConfig {
  dict: DictID
  text?: string
  payload?: { [index: string]: any }
  dictConfig?: Profile['dicts']['all'][keyof Profile['dicts']['all']]
}

const searchText = (...args) => console.log('searchText', ...args)
const recalcBodyHeight = (...args) => console.log('recalcBodyHeight', ...args)

export default function setupEnv ({
  dict, text = 'salad', payload = {}, dictConfig
}: EnvConfig) {
  const search = require('../dictionaries/' + dict + '/engine').search
  const View = translate()(require('../dictionaries/' + dict + '/View').default)

  require('../dictionaries/' + dict + '/_style.scss')

  const config = getDefaultConfig() as AppConfigMutable
  // config.langCode = 'en'
  // setTimeout(() => {
  //   i18n.changeLanguage('en')
  // }, 1000)
  const profile = getDefaultProfile() as ProfileMutable
  if (dictConfig) {
    profile.dicts.all[dict] = dictConfig
  }

  search(text, config, profile, payload)
    .then(result => {
      ReactDOM.render(
        <ProviderI18next i18n={i18n}>
        <div className={`panel-DictItem${config.animation ? ' isAnimate' : ''}`}>
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
              <View {...result} searchText={searchText} recalcBodyHeight={recalcBodyHeight} />
            </article>
          </div>
        </div>
        </ProviderI18next>,
        root,
      )
    })
}
