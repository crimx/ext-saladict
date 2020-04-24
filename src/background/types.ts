import { AppConfig } from '@/app-config'
import { Profile, ProfileIDList } from '@/app-config/profiles'

declare global {
  interface Window {
    appConfig: AppConfig
    activeProfile: Profile
    profileIDList: ProfileIDList
  }
}
