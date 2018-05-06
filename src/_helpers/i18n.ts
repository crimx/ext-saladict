import i18n from 'i18next'
import mapValues from 'lodash/mapValues'
import { storage } from '@/_helpers/browser-api'
import { AppConfig } from '@/app-config'

export interface RawLocale {
  zh_CN: string
  zh_TW: string
  en: string
}

export interface RawLocales {
  [message: string]: RawLocale
}

export default i18nLoader
export function i18nLoader (
  locales: { [namespace: string]: RawLocales },
  defaultNS?: string,
): i18n.i18n {
  const namespaces = Object.keys(locales)
  const instance = i18n
    .init({
      lng: browser.i18n.getUILanguage(),
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      saveMissing: false,
      load: 'currentOnly',

      defaultNS: defaultNS || namespaces[0] || 'translation',

      whitelist: ['en', 'zh_CN', 'zh_TW'],

      interpolation: {
        escapeValue: false, // not needed for react!!
      },

      resources: namespaces.reduce((res, ns) => {
        res.zh_CN[ns] = mapValues(locales[ns], x => x.zh_CN)
        res.zh_TW[ns] = mapValues(locales[ns], x => x.zh_TW)
        res.en[ns] = mapValues(locales[ns], x => x.en)
        return res
      }, { zh_CN: {}, zh_TW: {}, en: {} }),

    }, undefined)

  storage.sync.addListener<AppConfig>('config', ({ config }) => {
    if (config.newValue && instance.language !== config.newValue.langCode) {
      instance.changeLanguage(config.newValue.langCode)
    }
  })

  return instance
}
