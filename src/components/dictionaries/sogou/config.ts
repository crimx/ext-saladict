import { DictItem } from '@/app-config/dicts'

export type SogouConfig = DictItem<
  {
    pdfNewline: boolean
    tl:
      | 'default'
      | 'zh-CHS'
      | 'zh-CHT'
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

export default (): SogouConfig => ({
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
    tl: 'default'
  },
  options_sel: {
    tl: [
      'default',
      'zh-CHS',
      'zh-CHT',
      'en',
      'ja',
      'ko',
      'fr',
      'de',
      'es',
      'ru'
    ]
  }
})
