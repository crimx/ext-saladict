import i18n from 'i18next'
import mapValues from 'lodash/mapValues'
import mapKeys from 'lodash/mapKeys'
import { appConfigFactory } from '@/app-config'

const dictLocales = Object.keys(appConfigFactory().dicts.all)
  .map(dict => {
    const locale = require('@/components/dictionaries/' + dict + '/_locales')
    return {
      ['dict_' + dict]: locale.name,
      ...mapKeys(locale.options, (v, k) => `dict_${dict}_${k}`)
    }
  })
console.log(dictLocales)

const locales = Object.assign({}, require('@/_locales/messages'), ...dictLocales)

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
        translation: mapValues(locales, x => x.message ? x.message.zh_CN : x.zh_CN)
      },
      zh_TW: {
        translation: mapValues(locales, x => x.message ? x.message.zh_TW : x.zh_TW)
      },
      en: {
        translation: mapValues(locales, x => x.message ? x.message.en : x.en)
      },
    },
  })

export default instance
