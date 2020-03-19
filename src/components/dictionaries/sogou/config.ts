import { DictItem } from '@/app-config/dicts'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type SogouLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type SogouConfig = DictItem<{
  keepLF: 'none' | 'all' | 'webpage' | 'pdf'
  tl: 'default' | SogouLanguage
  tl2: 'default' | SogouLanguage
}>

export default (): SogouConfig => ({
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
    keepLF: 'webpage',
    tl: 'default',
    tl2: 'default'
  },
  options_sel: {
    keepLF: ['none', 'all', 'webpage', 'pdf'],
    tl: ['default', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    tl2: ['default', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru']
  }
})
