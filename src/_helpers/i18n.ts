import React, { useState, useEffect, FC, useContext } from 'react'
import mapValues from 'lodash/mapValues'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { createConfigStream } from '@/_helpers/config-manager'
import { useUpdateEffect } from 'react-use'

export type LangCode = 'zh-CN' | 'zh-TW' | 'en'
export type Namespace =
  | 'common'
  | 'content'
  | 'langcode'
  | 'menus'
  | 'options'
  | 'popup'
  | 'wordpage'
  | 'dicts'

export interface RawLocale {
  'zh-CN': string
  'zh-TW': string
  en: string
}

export interface RawLocales {
  [message: string]: RawLocale
}

export interface RawDictLocales {
  name: RawLocale
  options?: RawLocales
  helps?: RawLocales
}

export interface DictLocales {
  name: string
  options?: {
    [message: string]: any
  }
  helps?: {
    [message: string]: any
  }
}

export async function i18nLoader() {
  await i18n
    .use({
      type: 'backend',
      init: () => {},
      create: () => {},
      read: async (lang: LangCode, ns: Namespace, cb: Function) => {
        try {
          if (ns === 'dicts') {
            const dictLocals = extractDictLocales(lang)
            cb(null, dictLocals)
            return dictLocals
          }

          const { locale } = await import(
            /* webpackInclude: /_locales\/[^/]+\/[^/]+\.ts$/ */
            /* webpackChunkName: "locales/[request]" */
            /* webpackMode: "lazy" */
            `@/_locales/${lang}/${ns}.ts`
          )
          cb(null, locale)
          return locale
        } catch (err) {
          cb(err)
        }
      }
    })
    .use(initReactI18next as any)
    .init({
      lng: (/^(en|zh-CN|zh-TW)$/.exec(browser.i18n.getUILanguage()) || [
        'en'
      ])[0],
      fallbackLng: false,
      whitelist: ['en', 'zh-CN', 'zh-TW'],

      debug: process.env.NODE_ENV === 'development',
      saveMissing: false,
      load: 'currentOnly',

      ns: 'common',
      defaultNS: 'common',

      interpolation: {
        escapeValue: false // not needed for react as it escapes by default
      }
    })

  createConfigStream().subscribe(config => {
    if (i18n.language !== config.langCode) {
      i18n.changeLanguage(config.langCode)
    }
  })

  return i18n
}

const defaultT: i18n.TFunction = () => ''

export const I18nContext = React.createContext('')

export const I18nContextProvider: FC = ({ children }) => {
  const [lang, setLang] = useState(i18n.language)

  useEffect(() => {
    const setLangCallback = () => {
      setLang(i18n.language)
    }
    i18n.on('initialized', setLangCallback)
    i18n.on('languageChanged', setLangCallback)

    return () => {
      i18n.off('initialized', setLangCallback)
      i18n.off('languageChanged', setLangCallback)
    }
  }, [])

  return React.createElement(I18nContext.Provider, { value: lang }, children)
}

/**
 * Tailored for this project.
 * The official `useTranslation` is too heavy.
 * @param namespaces MUST be fixed.
 */
export function useTranslate(namespaces?: Namespace | Namespace[]) {
  const lang = useContext(I18nContext)

  const [result, setResult] = useState(() => {
    if (!lang) {
      return { t: defaultT, i18n }
    }

    if (!namespaces) {
      return { t: i18n.t, i18n }
    }

    if (
      Array.isArray(namespaces)
        ? namespaces.every(ns => i18n.hasResourceBundle(lang, ns))
        : i18n.hasResourceBundle(lang, namespaces)
    ) {
      return { t: i18n.getFixedT(lang, namespaces), i18n }
    }

    return { t: defaultT, i18n }
  })

  useEffect(() => {
    let isEffectRunning = true

    if (
      namespaces &&
      (Array.isArray(namespaces)
        ? namespaces.some(ns => !i18n.hasResourceBundle(lang, ns))
        : !i18n.hasResourceBundle(lang, namespaces))
    ) {
      i18n.loadNamespaces(namespaces).then(() => {
        if (isEffectRunning) {
          setResult({ t: i18n.getFixedT(lang, namespaces), i18n })
        }
      })
    }

    return () => {
      isEffectRunning = false
    }
  }, [])

  useUpdateEffect(() => {
    setResult({
      t: namespaces ? i18n.getFixedT(lang, namespaces) : i18n.t,
      i18n
    })
  }, [lang])

  return result
}

function extractDictLocales(lang: LangCode) {
  const req = require.context(
    '@/components/dictionaries',
    true,
    /_locales\.(json|ts)$/
  )
  return req.keys().reduce<{ [id: string]: DictLocales }>((o, filename) => {
    const localeModule = req(filename)
    const json: RawDictLocales = localeModule.locales || localeModule
    const dictId = /([^/]+)\/_locales\.(json|ts)$/.exec(filename)![1]
    o[dictId] = {
      name: json.name[lang]
    }
    if (json.options) {
      o[dictId].options = mapValues(json.options, rawLocale => rawLocale[lang])
    }
    if (json.helps) {
      o[dictId].helps = mapValues(json.helps, rawLocale => rawLocale[lang])
    }
    return o
  }, {})
}
