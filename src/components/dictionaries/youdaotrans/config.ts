import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type YoudaotransLanguage = Subunion<
  Language,
  'zh-CN' | 'en' | 'pt' | 'es' | 'ja' | 'ko' | 'fr' | 'ru'
>

export type YoudaotransConfig = MachineDictItem<YoudaotransLanguage>

export default (): YoudaotransConfig =>
  machineConfig<YoudaotransConfig>(
    ['zh-CN', 'en', 'pt', 'es', 'ja', 'ko', 'fr', 'ru'],
    {
      lang: '11011111'
    },
    {},
    {}
  )
