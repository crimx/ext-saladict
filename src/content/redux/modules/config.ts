import { getDefaultConfig, AppConfig } from '@/app-config'
import getDefaultProfile, { Profile } from '@/app-config/profiles'
import { addConfigListener } from '@/_helpers/config-manager'
import { addActiveProfileListener } from '@/_helpers/profile-manager'
import { StoreState, DispatcherThunk } from './index'
import { newConfig as newConfigDicts } from './dictionaries'
import { newConfig as newConfigWidget } from './widget'

/*-----------------------------------------------*\
    Action Type
\*-----------------------------------------------*/

export const enum ActionType {
  NEW_CONFIG = 'configs/NEW_CONFIG',
}

/*-----------------------------------------------*\
    Payload
\*-----------------------------------------------*/

interface ConfigPayload {
  [ActionType.NEW_CONFIG]: AppConfig | Profile
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export interface ConfigState {
  readonly config: AppConfig & Profile
}

export const initState: ConfigState = {
  config: {
    ...getDefaultConfig(),
    ...getDefaultProfile(),
  }
}

/*-----------------------------------------------*\
    Reducer Object
\*-----------------------------------------------*/

type ConfigReducer = {
  [k in ActionType]: (state: StoreState, payload: ConfigPayload[k]) => StoreState
}

export const reducer: ConfigReducer = {
  [ActionType.NEW_CONFIG] (state, configOrProfile) {
    return {
      ...state,
      config: {
        ...state.config,
        ...configOrProfile,
      }
    }
  }
}

export default reducer

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

interface Action<T extends ActionType> {
  type: T,
  payload?: ConfigPayload[T]
}

/** When app config is updated */
export function newConfig (configOrProfile: AppConfig | Profile): Action<ActionType.NEW_CONFIG> {
  return { type: ActionType.NEW_CONFIG, payload: configOrProfile }
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

/** Listen to config change and update config */
export function startUpAction (): DispatcherThunk {
  return dispatch => {
    addConfigListener(({ newConfig: config }) => {
      dispatch(updateConfig([config]))
    })
    addActiveProfileListener(({ newProfile }) => {
      dispatch(updateConfig([newProfile]))
    })
  }
}

export function updateConfig (configOrProfiles: Array<AppConfig | Profile>): DispatcherThunk {
  return dispatch => {
    configOrProfiles.forEach(item => dispatch(newConfig(item)))
    // first widget then dicts so that the panel rect is re-calculated
    dispatch(newConfigWidget())
    dispatch(newConfigDicts())
  }
}
