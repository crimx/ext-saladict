import { DictItem } from '@/app-config/dicts'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type GoogleLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'nl'
>

export type GoogleConfig = DictItem<{
  pdfNewline: boolean
  cnfirst: boolean
  concurrent: boolean
  tl: 'default' | GoogleLanguage
}>

export default (): GoogleConfig => ({
  lang: '11111111',
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
    cnfirst: true,
    concurrent: false,
    tl: 'default'
  },
  options_sel: {
    tl: [
      'default',
      'zh-CN',
      'zh-TW',
      'en',
      'ja',
      'ko',
      'fr',
      'de',
      'es',
      'ru',
      'nl'
    ]
  }
})
