import { DictItem } from '@/app-config/dicts'

export type TencentConfig = DictItem<
  {
    pdfNewline: boolean
    tl: 'default' | 'zh' | 'en' | 'jp' | 'kr' | 'fr' | 'de' | 'es' | 'ru'
  },
  'tl'
>

export default (): TencentConfig => ({
  lang: '11011111',
  selectionLang: {
    english: true,
    chinese: true,
    japanese: true,
    korean: true,
    french: true,
    spanish: true,
    deutsch: true,
    others: true,
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
  preferredHeight: 320,
  selectionWC: {
    min: 1,
    max: 999999999999999,
  },
  options: {
    /** Keep linebreaks on PDF */
    pdfNewline: false,
    tl: 'default',
  },
  options_sel: {
    tl: ['default', 'zh', 'en', 'jp', 'kr', 'fr', 'de', 'es', 'ru'],
  },
})
