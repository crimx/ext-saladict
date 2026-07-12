import i18n from 'i18next'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { LangCode } from '@/app-config'
import { getStaticLocale, StaticNamespace } from './static-locales'

export type BackgroundNamespace = StaticNamespace | 'sync'

export async function backgroundI18nLoader(): Promise<i18n.i18n> {
  if (i18n.language) {
    return i18n
  }

  const { langCode } = await getConfig()

  await i18n
    .use({
      type: 'backend',
      init: () => {},
      create: () => {},
      read: async (lang: LangCode, ns: BackgroundNamespace, cb: Function) => {
        try {
          if (ns === 'sync') {
            const syncLocales = extractSyncServiceLocales(lang)
            cb(null, syncLocales)
            return syncLocales
          }

          const locale = getStaticLocale(lang, ns)
          cb(null, locale)
          return locale
        } catch (error) {
          cb(error)
        }
      }
    })
    .init({
      lng: langCode,
      fallbackLng: false,
      whitelist: ['en', 'zh-CN', 'zh-TW', 'ko'],
      debug: process.env.NODE_ENV === 'development',
      saveMissing: false,
      load: 'currentOnly',
      ns: 'common',
      defaultNS: 'common',
      interpolation: {
        escapeValue: false
      }
    })

  addConfigListener(({ newConfig }) => {
    if (i18n.language !== newConfig.langCode) {
      i18n.changeLanguage(newConfig.langCode)
    }
  })

  return i18n
}

function extractSyncServiceLocales(lang: LangCode) {
  const req = require.context(
    '@/background/sync-manager/services',
    true,
    /_locales\/.+\.ts$/
  )

  return req.keys().reduce<{ [id: string]: any }>((result, filename) => {
    const idMatch = new RegExp(`/([^/]+)/_locales/${lang}\\.ts$`).exec(filename)
    if (idMatch) {
      const localeModule = req(filename)
      result[idMatch[1]] = localeModule.locale || localeModule
    }
    return result
  }, {})
}
