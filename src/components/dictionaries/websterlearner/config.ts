import { DictItem } from '@/app-config/dicts'

export type WebsterlearnerConfig = DictItem<{
  defs: boolean
  phrase: boolean
  derived: boolean
  arts: boolean
  related: boolean
}>

export default (): WebsterlearnerConfig => ({
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
  preferredHeight: 265,
  selectionWC: {
    min: 1,
    max: 5
  },
  options: {
    defs: true,
    phrase: true,
    derived: true,
    arts: true,
    related: true
  }
})
