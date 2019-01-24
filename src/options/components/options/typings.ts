import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { TranslationFunction } from 'i18next'

export interface Props {
  config: AppConfig
  profile: Profile
  t: TranslationFunction
}
