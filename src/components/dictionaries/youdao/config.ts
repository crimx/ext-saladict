import { DictItem } from '@/app-config/dicts'

export type YoudaoConfig = DictItem<{
  basic: boolean
  collins: boolean
  discrimination: boolean
  sentence: boolean
  translation: boolean
  related: boolean
}>

export default (): YoudaoConfig => ({
  lang: '11000000',
  selectionLang: {
    english: true,
    chinese: true,
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
    max: 999999999999999
  },
  options: {
    basic: true,
    collins: true,
    discrimination: true,
    sentence: true,
    translation: false,
    related: true
  }
})
