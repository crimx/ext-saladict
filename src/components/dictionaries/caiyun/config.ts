import { DictItem } from '@/app-config/dicts'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type CaiyunLanguage = Subunion<Language, 'zh-CN' | 'en' | 'ja'>

export type CaiyunConfig = DictItem<{
  keepLF: 'none' | 'all' | 'webpage' | 'pdf'
  tl: 'default' | CaiyunLanguage
  tl2: 'default' | CaiyunLanguage
}>

export default (): CaiyunConfig => ({
  lang: '11010000',
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
    tl: ['default', 'zh-CN', 'en', 'ja'],
    tl2: ['default', 'zh-CN', 'en', 'ja']
  }
})
