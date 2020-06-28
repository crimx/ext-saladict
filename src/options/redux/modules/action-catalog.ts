import { CreateActionCatalog } from 'retux'
import { AppConfig } from '@/app-config'
import { Profile, ProfileIDList } from '@/app-config/profiles'

export type ActionCatalog = CreateActionCatalog<{
  NEW_CONFIG: {
    payload: AppConfig
  }

  NEW_PROFILES: {
    payload: ProfileIDList
  }

  NEW_ACTIVE_PROFILE: {
    payload: Profile
  }

  UPLOAD_STATUS: {
    payload: 'idle' | 'uploading' | 'error'
  }
}>
