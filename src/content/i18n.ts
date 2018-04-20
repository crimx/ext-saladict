import i18n from 'i18next'
import mapValues from 'lodash/mapValues'
import { appConfigFactory } from '@/app-config'

const dictLocales = Object.keys(appConfigFactory().dicts.all)
  .reduce((result, id) => {
    const locale = require('@/components/dictionaries/' + id + '/_locales')
    result['dict_' + id] = locale.name
    return result
  }, {})

const locales = { ...require('@/_locales/content'), ...dictLocales }

const instance = (i18n as any)
  .init({
    lng: browser.i18n.getUILanguage(),
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
        translation: mapValues(locales, x => x.zh_CN)
      },
      zh_TW: {
        translation: mapValues(locales, x => x.zh_TW)
      },
      en: {
        translation: mapValues(locales, x => x.en)
      },
    },
  })

export default instance
