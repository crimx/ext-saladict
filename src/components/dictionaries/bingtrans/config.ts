import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type BingtransLanguage = Subunion<
  Language,
  | 'zh-CN'
  | 'zh-TW'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'de'
  | 'es'
  | 'ru'
  | 'nl'
  | 'pt'
>

export type BingtransConfig = MachineDictItem<BingtransLanguage>

export default (): BingtransConfig =>
  machineConfig<BingtransConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'nl', 'pt'],
    {},
    {},
    {}
  )
