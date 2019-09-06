import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { i18n, TFunction } from 'i18next'

export interface Props {
  config: AppConfig
  profile: Profile
  t: TFunction
  i18n: i18n
}
