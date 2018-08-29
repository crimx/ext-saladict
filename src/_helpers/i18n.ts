import i18n from 'i18next'
import mapValues from 'lodash/mapValues'
import { createActiveConfigStream } from '@/_helpers/config-manager'

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
  defaultNS: string,
  cb?: i18n.Callback
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

      whitelist: ['en', 'zh-CN', 'zh-TW'],

      interpolation: {
        escapeValue: false, // not needed for react!!
      },

      resources: namespaces.reduce((res, ns) => {
        res['zh-CN'][ns] = mapValues(locales[ns], x => x.zh_CN)
        res['zh-TW'][ns] = mapValues(locales[ns], x => x.zh_TW)
        res.en[ns] = mapValues(locales[ns], x => x.en)
        return res
      }, { 'zh-CN': {}, 'zh-TW': {}, en: {} }),

    }, cb)

  createActiveConfigStream().subscribe(config => {
    if (instance.language !== config.langCode) {
      instance.changeLanguage(config.langCode)
    }
  })

  return instance
}
