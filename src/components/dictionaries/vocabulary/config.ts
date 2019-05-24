import { DictItem } from '@/app-config/dicts'

export type VocabularyConfig = DictItem

export default (): VocabularyConfig => ({
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
  preferredHeight: 180,
  selectionWC: {
    min: 1,
    max: 5,
  },
})
