import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type CaiyunLanguage = Subunion<Language, 'zh-CN' | 'en' | 'ja'>

export type CaiyunConfig = MachineDictItem<CaiyunLanguage>

export default (): CaiyunConfig =>
  machineConfig<CaiyunConfig>(
    ['zh-CN', 'en', 'ja'],
    {
      lang: '11010000'
    },
    {},
    {}
  )
