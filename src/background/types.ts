import { AppConfig } from '@/app-config'

declare global {
  interface Window {
    appConfig: AppConfig
  }
}
