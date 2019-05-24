import { DictItem } from '@/app-config/dicts'

export type LongmanConfig = DictItem<{
  wordfams: boolean
  collocations: boolean
  grammar: boolean
  thesaurus: boolean
  examples: boolean
  bussinessFirst: boolean
  related: boolean
}>

export default (): LongmanConfig => ({
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
  preferredHeight: 265,
  selectionWC: {
    min: 1,
    max: 5,
  },
  options: {
    wordfams: false,
    collocations: true,
    grammar: true,
    thesaurus: true,
    examples: true,
    bussinessFirst: true,
    related: true,
  }
})
