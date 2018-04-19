import i18n from 'i18next'
import XHR from 'i18next-xhr-backend'
import mapValues from 'lodash/mapValues'

const instance = (i18n as any)
  .use(XHR)
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

    backend: {
      loadPath: browser.runtime.getURL('_locales') + '/{{lng}}/messages.json',
      addPath: browser.runtime.getURL(''),
      parse: (chromeLocales: string) => mapValues(JSON.parse(chromeLocales), x => x.message),
      crossDomain: true,
    }
  })

export default instance
