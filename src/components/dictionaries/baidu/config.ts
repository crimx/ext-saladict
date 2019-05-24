import { DictItem } from '@/app-config/dicts'

export type BaiduConfig = DictItem<
  {
    pdfNewline: boolean
    tl: 'default' | 'zh' | 'cht' | 'en' | 'jp' | 'kor' | 'fra' | 'de' | 'spa' | 'ru'
  },
  'tl'
>

export default (): BaiduConfig => ({
  lang: '11111111',
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
    tl: ['default', 'zh', 'cht', 'en', 'jp', 'kor', 'fra', 'de', 'spa', 'ru'],
  },
})
