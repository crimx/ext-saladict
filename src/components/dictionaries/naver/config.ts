import { DictItem } from '@/app-config/dicts'

export type NaverConfig = DictItem<{
  hanAsJa: boolean
  korAsJa: boolean
}>

export default (): NaverConfig => ({
  lang: '01011000',
  selectionLang: {
    english: false,
    chinese: true,
    japanese: true,
    korean: true,
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
  preferredHeight: 465,
  selectionWC: {
    min: 1,
    max: 10,
  },
  options: {
    hanAsJa: false,
    korAsJa: false,
  },
})
