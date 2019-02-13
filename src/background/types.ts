import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'

declare global {
  interface Window {
    appConfig: AppConfig
    activeProfile: Profile
  }
}
