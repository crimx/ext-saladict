import React, { FC, useEffect } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import createStore from '@/content/redux/create'
import { useRefFn, useObservableState, useObservable } from 'observable-hooks'
import { distinctUntilChanged, map, startWith } from 'rxjs/operators'

import SaladBowlContainer from '@/content/components/SaladBowl/SaladBowl.container'
import DictPanelContainer from '@/content/components/DictPanel/DictPanel.container'
import WordEditorContainer from '@/content/components/WordEditor/WordEditor.container'

import { createConfigStream } from '@/_helpers/config-manager'
import { reportGA } from '@/_helpers/analytics'
import { I18nContextProvider } from '@/_helpers/i18n'
import { timer } from '@/_helpers/promise-more'

import { ConfigProvider as AntdConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import './_style.scss'

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US
}

export interface AntdRootProps {
  /** analytics path */
  path?: string
}

export const AntdRoot: FC<AntdRootProps> = props => {
  const storeRef = useRefFn(createStore)

  const { locale, analytics } = useObservableState(
    useObservable(() =>
      createConfigStream().pipe(
        distinctUntilChanged(
          (oldConfig, newConfig) =>
            oldConfig.langCode === newConfig.langCode &&
            oldConfig.analytics === newConfig.analytics
        ),
        map(config => ({
          locale: antdLocales[config.langCode] || en_US,
          analytics: config.analytics
        })),
        startWith({
          locale: zh_CN,
          analytics: false
        })
      )
    )
  )!

  useEffect(() => {
    if (analytics && props.path) {
      reportGA(props.path)
    }
  }, [analytics, props.path])

  return (
    <I18nContextProvider>
      <ReduxProvider store={storeRef.current}>
        <AntdConfigProvider locale={locale}>
          {props.children}
        </AntdConfigProvider>
        <SaladBowlContainer />
        <DictPanelContainer />
        <WordEditorContainer />
      </ReduxProvider>
    </I18nContextProvider>
  )
}

export async function switchAntdTheme(darkMode: boolean): Promise<void> {
  const $root = document.querySelector('#root')!

  await new Promise(resolve => {
    const filename = `antd${darkMode ? '.dark' : ''}.min.css`
    const href =
      process.env.NODE_ENV === 'development'
        ? `https://cdnjs.cloudflare.com/ajax/libs/antd/4.1.0/filename`
        : `/assets/${filename}`
    let $link = document.head.querySelector<HTMLLinkElement>(
      'link#saladict-antd-theme'
    )

    if ($link && $link.getAttribute('href') === href) {
      resolve()
      return
    }

    // smooth dark/bright transition
    $root.classList.toggle('saladict-theme-dark', darkMode)
    $root.classList.toggle('saladict-theme-bright', !darkMode)
    $root.classList.toggle('saladict-theme-loading', true)

    if ($link) {
      $link.setAttribute('href', href)
    } else {
      $link = document.createElement('link')
      $link.setAttribute('id', 'saladict-antd-theme')
      $link.setAttribute('rel', 'stylesheet')
      $link.setAttribute('href', href)
      document.head.insertBefore($link, document.head.firstChild)
    }

    let loaded = false

    // @ts-ignore
    $link.onreadystatechange = function() {
      // @ts-ignore
      if (this.readyState === 'complete' || this.readyState === 'loaded') {
        if (loaded === false) {
          resolve()
        }
        loaded = true
      }
    }

    $link.onload = function() {
      if (loaded === false) {
        resolve()
      }
      loaded = true
    }

    const img = document.createElement('img')
    img.onerror = function() {
      if (loaded === false) {
        resolve()
      }
      loaded = true
    }
    img.src = href
  })

  await timer(100)
  setTimeout(() => {
    $root.classList.toggle('saladict-theme-loaded', true)
    $root.classList.toggle('saladict-theme-loading', false)
  }, 400)
}
