import { PromiseType } from 'utility-types'
import { getConfig } from '@/_helpers/config-manager'
import { getProfileIDList, getActiveProfile } from '@/_helpers/profile-manager'

export const initState = async () => {
  const pConfig = getConfig()
  const pProfiles = getProfileIDList()
  const pActiveProfile = getActiveProfile()

  return {
    config: await pConfig,
    profiles: await pProfiles,
    activeProfile: await pActiveProfile,
    uploadStatus: 'idle' as 'idle' | 'uploading' | 'error'
  }
}

export type State = PromiseType<ReturnType<typeof initState>>

export default initState
