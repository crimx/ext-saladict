import { DictItem } from '@/app-config/dicts'

export type HjdictConfig = DictItem<
  {
    related: boolean
    chsas: 'jp/cj' | 'jp/jc' | 'kr' | 'w' | 'fr' | 'de' | 'es'
    engas: 'w' | 'fr' | 'de' | 'es'
    uas: 'fr' | 'de' | 'es'
    aas: 'fr' | 'de'
    eas: 'fr' | 'es'
  },
  'chsas' | 'engas' | 'uas' | 'aas' | 'eas'
>

export default (): HjdictConfig => ({
  lang: '10011111',
  selectionLang: {
    english: true,
    chinese: true,
    japanese: true,
    korean: true,
    french: true,
    spanish: true,
    deutsch: true,
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
    max: 10,
  },
  options: {
    related: true,
    chsas: 'jp/jc',
    engas: 'w',
    uas: 'fr',
    aas: 'fr',
    eas: 'fr',
  },
  options_sel: {
    chsas: ['jp/cj', 'jp/jc', 'kr', 'w', 'fr', 'de', 'es'],
    engas: ['w', 'fr', 'de', 'es'],
    uas: ['fr', 'de', 'es'],
    aas: ['fr', 'de'],
    eas: ['fr', 'es'],
  },
})
