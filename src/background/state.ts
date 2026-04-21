import { AppConfig } from '@/app-config'
import { Profile, ProfileIDList } from '@/app-config/profiles'
import { addConfigListener, getConfig } from '@/_helpers/config-manager'
import {
  addActiveProfileListener,
  addProfileIDListListener,
  getActiveProfile,
  getProfileIDList,
  initProfiles
} from '@/_helpers/profile-manager'

export interface BackgroundState {
  appConfig: AppConfig
  activeProfile: Profile
  profileIDList: ProfileIDList
}

let currentState: BackgroundState | null = null
let loadingState: Promise<BackgroundState> | null = null
let isSyncStarted = false

export function hasBackgroundState() {
  return currentState != null
}

export function getBackgroundStateSnapshot(): BackgroundState {
  if (!currentState) {
    throw new Error('Background state has not been initialized yet.')
  }
  return currentState
}

export function replaceBackgroundState(
  state: BackgroundState
): BackgroundState {
  currentState = state
  return state
}

export async function initBackgroundState(): Promise<BackgroundState> {
  startBackgroundStateSync()

  if (currentState) {
    return currentState
  }

  if (!loadingState) {
    loadingState = loadBackgroundState()
      .then(replaceBackgroundState)
      .finally(() => {
        loadingState = null
      })
  }

  return loadingState
}

async function loadBackgroundState(): Promise<BackgroundState> {
  const [appConfig, activeProfile, profileIDList] = await Promise.all([
    getConfig(),
    getActiveProfile(),
    getProfileIDList()
  ])

  if (profileIDList.length > 0) {
    return {
      appConfig,
      activeProfile,
      profileIDList
    }
  }

  const initializedProfile = await initProfiles()

  return {
    appConfig,
    activeProfile: initializedProfile,
    profileIDList: await getProfileIDList()
  }
}

function startBackgroundStateSync() {
  if (isSyncStarted) {
    return
  }
  isSyncStarted = true

  addConfigListener(({ newConfig }) => {
    if (currentState) {
      currentState = {
        ...currentState,
        appConfig: newConfig
      }
    }
  }).catch(console.error)

  addActiveProfileListener(({ newProfile }) => {
    if (currentState) {
      currentState = {
        ...currentState,
        activeProfile: newProfile
      }
    }
  }).catch(console.error)

  addProfileIDListListener(({ newValue }) => {
    if (currentState) {
      currentState = {
        ...currentState,
        profileIDList: newValue
      }
    }
  })
}
