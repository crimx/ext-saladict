import { DictItem } from '@/app-config/dicts'

export type AhdictConfig = DictItem<{
  resultnum: number
}>

export default (): AhdictConfig => ({
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
  preferredHeight: 240,
  selectionWC: {
    min: 1,
    max: 5
  },
  options: {
    resultnum: 4
  }
})
