import { DictItem } from '@/app-config/dicts'

export type GoogleConfig = DictItem<
  {
    pdfNewline: boolean
    cnfirst: boolean
    tl:
      | 'default'
      | 'zh-CN'
      | 'zh-TW'
      | 'en'
      | 'ja'
      | 'ko'
      | 'fr'
      | 'de'
      | 'es'
      | 'ru'
  },
  'tl'
>

export default (): GoogleConfig => ({
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
  preferredHeight: 320,
  selectionWC: {
    min: 1,
    max: 999999999999999
  },
  options: {
    /** Keep linebreaks on PDF */
    pdfNewline: false,
    cnfirst: true,
    tl: 'default'
  },
  options_sel: {
    tl: ['default', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru']
  }
})
