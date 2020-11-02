import { DictItem } from '@/app-config/dicts'

export type CobuildConfig = DictItem<{
  cibaFirst: boolean
}>

export default (): CobuildConfig => ({
  lang: '10000000',
  selectionLang: {
    english: true,
    chinese: false,
    japanese: false,
    korean: false,
    french: false,
    spanish: false,
    deutsch: false,
    others: false,
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
  preferredHeight: 300,
  selectionWC: {
    min: 1,
    max: 5
  },
  options: {
    cibaFirst: (browser.i18n.getUILanguage() || 'en').startsWith('zh-')
  }
})
