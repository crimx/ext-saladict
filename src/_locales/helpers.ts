import mapValues from 'lodash/mapValues'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// import { createConfigStream } from '@/_helpers/config-manager'

if (process.env.NODE_ENV === 'production') {
  // for dynamic import
  window.__webpack_public_path__ = browser.runtime.getURL('/')
}

export type LangCode = 'zh-CN' | 'zh-TW' | 'en'
export type Namespace =
  | 'common'
  | 'content'
  | 'popup'
  | 'options'
  | 'menus'
  | 'profiles'
  | 'dicts'
  | 'langcode'

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

export function i18nLoader(namespaces: Namespace[], defaultNS?: Namespace) {
  i18n
    .use({
      type: 'backend',
      read: (lang: LangCode, ns: Namespace, cb: Function) => {
        if (ns === 'dicts') {
          cb(null, extractDictLocales(lang))
          return
        }

        import(
          /* webpackExclude: /helpers\.ts$/ */
          /* webpackChunkName: "locales/[request]" */
          `./${lang}/${ns}.ts`
        ).then(bundle => {
          cb(null, bundle.locale)
        })
      }
    })
    .use(initReactI18next)
    .init({
      lng: browser.i18n.getUILanguage(),
      fallbackLng: 'en',
      whitelist: ['en', 'zh-CN', 'zh-TW'],

      debug: process.env.NODE_ENV === 'development',
      saveMissing: false,
      load: 'currentOnly',

      ns: namespaces,
      defaultNS: defaultNS || namespaces[0] || 'translation',

      interpolation: {
        escapeValue: false // not needed for react as it escapes by default
      }
    })

  // createConfigStream().subscribe(config => {
  //   if (i18next.language !== config.langCode) {
  //     i18next.changeLanguage(config.langCode)
  //   }
  // })
  return i18n
}

export function extractDictLocales(lang: LangCode) {
  // @todo replace with dict id & import()
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
    if (window.__SALADICT_OPTIONS_PAGE__) {
      if (json.options) {
        o[dictId].options = mapValues(
          json.options,
          rawLocale => rawLocale[lang]
        )
      }
      if (json.helps) {
        o[dictId].helps = mapValues(json.helps, rawLocale => rawLocale[lang])
      }
    }
    return o
  }, {})
}
