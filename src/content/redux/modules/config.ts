import { getDefaultConfig, AppConfig } from '@/app-config'
import { getDefaultProfile, Profile } from '@/app-config/profiles'
import { addConfigListener } from '@/_helpers/config-manager'
import { addActiveProfileListener } from '@/_helpers/profile-manager'
import { createReducer } from '../utils/createReducer'
import { Init } from '../utils/types'

export interface Payload {
  'CONFIG/NEW_CONFIG': AppConfig
  'CONFIG/NEW_PROFILE': Profile
}

export type State = typeof initState

const initState = {
  config: getDefaultConfig(),
  activeProfile: getDefaultProfile()
}

export const reducer = createReducer<Payload, State>(initState, {
  'CONFIG/NEW_CONFIG': (state, action) => ({
    ...state,
    config: action.payload
  }),
  'CONFIG/NEW_PROFILE': (state, action) => ({
    ...state,
    activeProfile: action.payload
  })
})

export default reducer

export const init: Init<Payload> = dispatch => {
  addConfigListener(({ newConfig }) => {
    dispatch({ type: 'CONFIG/NEW_CONFIG', payload: newConfig })
  })

  addActiveProfileListener(({ newProfile }) => {
    dispatch({ type: 'CONFIG/NEW_PROFILE', payload: newProfile })
  })
}
