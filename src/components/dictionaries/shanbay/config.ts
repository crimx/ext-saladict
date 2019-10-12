import { DictItem } from '@/app-config/dicts'

export type ShanbayConfig = DictItem<{
  basic: boolean
  sentence: boolean
}>

export default (): ShanbayConfig => ({
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
  preferredHeight: 150,
  selectionWC: {
    min: 1,
    max: 30
  },
  options: {
    basic: true,
    sentence: true
  }
})
