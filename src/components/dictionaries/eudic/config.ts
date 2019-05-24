import { DictItem } from '@/app-config/dicts'

export type EudicConfig = DictItem<{
  resultnum: number
}>

export default (): EudicConfig => ({
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
  },
  preferredHeight: 240,
  selectionWC: {
    min: 1,
    max: 5,
  },
  options: {
    resultnum: 10
  }
})
