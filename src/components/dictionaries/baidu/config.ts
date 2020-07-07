import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type BaiduLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'nl'
>

export type BaiduConfig = MachineDictItem<BaiduLanguage>

export default (): BaiduConfig =>
  machineConfig<BaiduConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'nl'],
    {},
    {},
    {}
  )
