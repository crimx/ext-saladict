import { DictItem } from '@/app-config/dicts'

export type LianganConfig = DictItem

export default (): LianganConfig => ({
  lang: '10010000',
  selectionLang: {
    english: false,
    chinese: true,
    japanese: true,
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
  }
})
