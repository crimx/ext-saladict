import { DictItem } from '@/app-config/dicts'

export type CaiyunConfig = DictItem<
  {
    pdfNewline: boolean
    tl: 'default' | 'zh' | 'en' | 'ja'
  },
  'tl'
>

export default (): CaiyunConfig => ({
  lang: '11010000',
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
    tl: ['default', 'zh', 'en', 'ja'],
  },
})
