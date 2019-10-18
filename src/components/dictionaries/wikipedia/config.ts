import { DictItem } from '@/app-config/dicts'

export type WikipediaConfig = DictItem<{
  lang: 'auto' | 'zh' | 'zh-cn' | 'zh-tw' | 'zh-hk' | 'en' | 'ja' | 'fr' | 'de'
}>

export default (): WikipediaConfig => ({
  lang: '11110000',
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
  preferredHeight: 420,
  selectionWC: {
    min: 1,
    max: 999999999999999
  },
  options: {
    lang: 'auto'
  },
  options_sel: {
    lang: ['auto', 'zh', 'zh-cn', 'zh-tw', 'zh-hk', 'en', 'ja', 'fr', 'de']
  }
})
