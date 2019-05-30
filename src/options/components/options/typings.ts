import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { i18n, TranslationFunction } from 'i18next'

export interface Props {
  config: AppConfig
  profile: Profile
  t: TranslationFunction
  i18n: i18n
}
