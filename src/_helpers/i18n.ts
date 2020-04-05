import React, { useState, useEffect, FC, useContext, useRef } from 'react'
import mapValues from 'lodash/mapValues'
import i18n, { TFunction } from 'i18next'
import { createConfigStream } from '@/_helpers/config-manager'

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

export const I18nContext = React.createContext<string | undefined>(undefined)
if (process.env.NODE_ENV === 'development') {
  I18nContext.displayName = 'I18nContext'
}

export const I18nContextProvider: FC = ({ children }) => {
  const [lang, setLang] = useState<string | undefined>(undefined)

  useEffect(() => {
    const setLangCallback = () => {
      setLang(i18n.language)
    }

    i18n.on('initialized', setLangCallback)
    i18n.on('languageChanged', setLangCallback)

    if (!i18n.language) {
      i18nLoader()
    }

    return () => {
      i18n.off('initialized', setLangCallback)
      i18n.off('languageChanged', setLangCallback)
    }
  }, [])

  return React.createElement(I18nContext.Provider, { value: lang }, children)
}

export interface UseTranslateResult {
  /**
   * fixedT with the first namespace as default.
   * It is a wrapper of the original fixedT, which
   * keeps the same reference even after namespaces are loaded
   */
  t: i18n.TFunction
  i18n: i18n.i18n
  /** Are namespaces loaded? */
  ready: boolean
}

/**
 * Tailored for this project.
 * The official `useTranslation` is too heavy.
 * @param namespaces will not monitor namespace changes.
 */
export function useTranslate(
  namespaces?: Namespace | Namespace[]
): UseTranslateResult {
  const innerTRef = useRef<TFunction>(defaultT)
  // keep the exposed t function always the same
  const tRef = useRef<TFunction>((...args: Parameters<TFunction>) =>
    innerTRef.current(...args)
  )
  const lang = useContext(I18nContext)

  const genResult = (t: TFunction | null, ready: boolean) => {
    if (t) {
      innerTRef.current = t
    }
    return { t: tRef.current, i18n, ready }
  }

  const [result, setResult] = useState<UseTranslateResult>(() => {
    if (!lang) {
      return genResult(defaultT, false)
    }

    if (!namespaces) {
      return genResult(i18n.t, true)
    }

    if (
      Array.isArray(namespaces)
        ? namespaces.every(ns => i18n.hasResourceBundle(lang, ns))
        : i18n.hasResourceBundle(lang, namespaces)
    ) {
      return genResult(i18n.getFixedT(lang, namespaces), true)
    }

    return genResult(defaultT, false)
  })

  useEffect(() => {
    let isEffectRunning = true

    if (lang) {
      if (namespaces) {
        if (
          Array.isArray(namespaces)
            ? namespaces.every(ns => i18n.hasResourceBundle(lang, ns))
            : i18n.hasResourceBundle(lang, namespaces)
        ) {
          setResult(genResult(i18n.getFixedT(lang, namespaces), true))
        } else {
          // keep the old t while marking not ready
          setResult(result => genResult(null, false))

          i18n.loadNamespaces(namespaces).then(() => {
            if (isEffectRunning) {
              setResult(genResult(i18n.getFixedT(lang, namespaces), true))
            }
          })
        }
      } else {
        setResult(genResult(i18n.t, true))
      }
    }

    return () => {
      isEffectRunning = false
    }
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
