import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type TencentLanguage = Subunion<
  Language,
  'zh-CN' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type TencentConfig = MachineDictItem<TencentLanguage>

export default (): TencentConfig =>
  machineConfig<TencentConfig>(
    ['zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    {
      lang: '11011111'
    },
    {},
    {}
  )
