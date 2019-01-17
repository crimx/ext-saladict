import { AppConfig } from '@/app-config'
import { TranslationFunction } from 'i18next'

export interface Props {
  config: AppConfig
  t: TranslationFunction
}
