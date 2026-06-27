import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type DeepLLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type DeepLConfig = MachineDictItem<DeepLLanguage>

export default (): DeepLConfig =>
  machineConfig<DeepLConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    {},
    {},
    {}
  )
