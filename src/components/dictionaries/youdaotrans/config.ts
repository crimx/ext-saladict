import { DictItem } from '@/app-config/dicts'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type YoudaotransLanguage = Subunion<
  Language,
  'zh-CN' | 'en' | 'pt' | 'es' | 'ja' | 'ko' | 'fr' | 'ru'
>

export type YoudaotransConfig = DictItem<{
  pdfNewline: boolean
  tl: 'default' | YoudaotransLanguage
  tl2: 'default' | YoudaotransLanguage
}>

export default (): YoudaotransConfig => ({
  lang: '11011111',
  selectionLang: {
    english: true,
    chinese: true,
    japanese: true,
    korean: true,
    french: true,
    spanish: true,
    deutsch: true,
    others: true,
    matchAll: false
  },
  defaultUnfold: {
    english: true,
    chinese: true,
    japanese: true,
    korean: true,
    french: true,
    spanish: true,
    deutsch: true,
    others: true,
    matchAll: false
  },
  preferredHeight: 320,
  selectionWC: {
    min: 1,
    max: 999999999999999
  },
  options: {
    /** Keep linebreaks on PDF */
    pdfNewline: false,
    tl: 'default',
    tl2: 'default'
  },
  options_sel: {
    tl: ['default', 'zh-CN', 'en', 'pt', 'es', 'ja', 'ko', 'fr', 'ru'],
    tl2: ['default', 'zh-CN', 'en', 'pt', 'es', 'ja', 'ko', 'fr', 'ru']
  }
})
