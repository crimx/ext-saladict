import { addConfigListener } from '@/_helpers/config-manager'
import {
  addActiveProfileListener,
  addProfileIDListListener
} from '@/_helpers/profile-manager'
import { Dispatch } from 'redux'
import { StoreAction, StoreState } from './modules'

export const init = (
  dispatch: Dispatch<StoreAction>,
  getState: () => StoreState
) => {
  addConfigListener(({ newConfig }) => {
    dispatch({ type: 'NEW_CONFIG', payload: newConfig })
  })

  addActiveProfileListener(({ newProfile }) => {
    dispatch({ type: 'NEW_ACTIVE_PROFILE', payload: newProfile })
  })

  addProfileIDListListener(({ newValue }) => {
    dispatch({ type: 'NEW_PROFILES', payload: newValue })
  })
}
