import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getDefaultConfig, AppConfig } from '@/app-config'
import { getDefaultProfile, Profile, ProfileIDList } from '@/app-config/profiles'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { message as browserMessage } from '@/_helpers/browser-api'
import { MsgSelection, MsgType } from '@/typings/message'
import { getDefaultSelectionInfo } from '@/_helpers/selection'
import { timer } from '@/_helpers/promise-more'
import {
  getActiveProfile,
  addActiveProfileListener,
  getProfileIDList,
  addProfileIDListListener,
} from '@/_helpers/profile-manager'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import contextLocles from '@/_locales/context'
import profileLocles from '@/_locales/config-profiles'

import { LocaleProvider as ProviderAntdLocale, message } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import './_style.scss'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_OPTIONS_PAGE__ = true
window.__SALADICT_LAST_SEARCH__ = ''

const i18n = i18nLoader({
  common: commonLocles,
  opt: optionsLocles,
  dict: dictsLocles,
  ctx: contextLocles,
  profile: profileLocles,
}, 'opt')

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US,
}

export interface OptionsProps {
}

export interface OptionsState {
  config: AppConfig
  profile: Profile
  profileIDList: ProfileIDList
  rawProfileName: string
}

export class Options extends React.Component<OptionsProps, OptionsState> {
  constructor (props: OptionsProps) {
    super(props)

    this.state = {
      config: getDefaultConfig(),
      profile: getDefaultProfile(),
      profileIDList: [],
      rawProfileName: '',
    }

    Promise.all([getConfig(), getActiveProfile(), getProfileIDList()])
      .then(async ([ config, profile, profileIDList ]) => {
        this.setState({
          config,
          profile,
          profileIDList,
          rawProfileName: this.getActiveProfileName(profile.id, profileIDList),
        })

        if (process.env.NODE_ENV !== 'development') {
          if (window.innerWidth > 1024) {
            injectSaladictInternal()

            await timer(500)
            const text = await getWordOfTheDay()
            const $container = document.querySelector('.xmain-container')

            let mouseX: number
            if ($container) {
              const { left, width } = $container.getBoundingClientRect()
              mouseX = left + width / 2
            } else {
              mouseX = window.innerWidth - config.panelWidth - 150
            }

            browserMessage.self.send<MsgSelection>({
              type: MsgType.Selection,
              selectionInfo: getDefaultSelectionInfo({ text }),
              self: true,
              instant: true,
              mouseX,
              mouseY: 250,
              dbClick: false,
              shiftKey: false,
              ctrlKey: false,
              metaKey: false,
              force: false,
            })
          }
        }
      })

    addConfigListener(({ newConfig }) => {
      this.setState({ config: newConfig })
      message.destroy()
      message.success(i18n.t('msg_updated'))
    })

    addActiveProfileListener(({ newProfile }) => {
      this.setState({
        profile: newProfile,
        rawProfileName: this.getActiveProfileName(newProfile.id),
      })
      message.destroy()
      message.success(i18n.t('msg_updated'))
    })

    addProfileIDListListener(({ newValue }) => {
      this.setState({ profileIDList: newValue })
      message.destroy()
      message.success(i18n.t('msg_updated'))
    })
  }

  getActiveProfileName = (
    activeID: string,
    profileIDList = this.state.profileIDList,
  ): string => {
    const activeProfileID = profileIDList.find(
      ({ id }) => id === activeID
    )
    return activeProfileID ? activeProfileID.name : ''
  }

  render () {
    return (
      <ProviderI18next i18n={i18n}>
        <ProviderAntdLocale locale={antdLocales[this.state.config.langCode] || zh_CN}>
          {React.createElement(App, { ...this.state })}
        </ProviderAntdLocale>
      </ ProviderI18next>
    )
  }
}

if (process.env.NODE_ENV !== 'development') {
  ReactDOM.render(<Options />, document.getElementById('root'))
}
