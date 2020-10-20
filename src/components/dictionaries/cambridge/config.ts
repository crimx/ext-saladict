import { DictItem } from '@/app-config/dicts'

export type CambridgeConfig = DictItem<{
  lang: 'default' | 'en' | 'en-chs' | 'en-chz'
  related: boolean
}>

export default (): CambridgeConfig => ({
  lang: '11100000',
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
  preferredHeight: 265,
  selectionWC: {
    min: 1,
    max: 5
  },
  options: {
    lang: 'default',
    related: true
  },
  options_sel: {
    lang: ['default', 'en', 'en-chs', 'en-chz']
  }
})
