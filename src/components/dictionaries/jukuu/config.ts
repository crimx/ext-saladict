import { DictItem } from '@/app-config/dicts'

export type JukuuConfig = DictItem<
  {
    lang: 'zheng' | 'engjp' | 'zhjp'
  },
  'lang'
>

export default (): JukuuConfig => ({
  lang: '11010000',
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
  preferredHeight: 300,
  selectionWC: {
    min: 1,
    max: 99999,
  },
  options: {
    lang: 'zheng',
  },
  options_sel: {
    lang: ['zheng', 'engjp', 'zhjp']
  },
})
