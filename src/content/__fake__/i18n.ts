import i18n from 'i18next'
import mapValues from 'lodash/mapValues'

const locales = require('@/_locales/messages.json')

const instance = (i18n as any)
  .init({
    lng: 'zh_CN',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV !== 'production',
    saveMissing: false,
    updateMissing: false,
    load: 'currentOnly',

    whitelist: ['en', 'zh_CN', 'zh_TW'],

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    resources: {
      zh_CN: {
        translation: mapValues(locales, x => x.message.zh_CN)
      },
      zh_TW: {
        translation: mapValues(locales, x => x.message.zh_TW)
      },
      en: {
        translation: mapValues(locales, x => x.message.en)
      },
    },
  })

export default instance
