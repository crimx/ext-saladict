import { useMemo } from 'react'
import mapValues from 'lodash/mapValues'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// import { createConfigStream } from '@/_helpers/config-manager'

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

export function i18nLoader() {
  i18n
    .use({
      type: 'backend',
      init: () => {},
      create: () => {},
      read: (lang: LangCode, ns: Namespace, cb: Function) => {
        if (ns === 'dicts') {
          cb(null, extractDictLocales(lang))
          return
        }
        cb(null, require(`@/_locales/${lang}/${ns}.ts`).locale)
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

      initImmediate: false, // sync init

      interpolation: {
        escapeValue: false // not needed for react as it escapes by default
      }
    })

  // createConfigStream().subscribe(config => {
  //   if (i18n.language !== config.langCode) {
  //     i18n.changeLanguage(config.langCode)
  //   }
  // })

  return i18n
}

/**
 * Tailored for this project.
 * The official `useTranslation` is too heavy.
 * @param namespaces Should be fixed.
 */
export function useTranslate(namespaces?: Namespace | Namespace[]) {
  return {
    t: useMemo(() => {
      if (namespaces) {
        i18n.loadNamespaces(namespaces)
      }
      return i18n.getFixedT(i18n.language, namespaces)
    }, [i18n.language]),
    i18n
  }
}

function extractDictLocales(lang: LangCode) {
  const req = require.context(
    '@/components/dictionaries',
    true,
    /_locales\.json$/
  )
  return req.keys().reduce<{ [id: string]: DictLocales }>((o, filename) => {
    const json: RawDictLocales = req(filename)
    const dictId = /([^/]+)\/_locales\.json$/.exec(filename)![1]
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
