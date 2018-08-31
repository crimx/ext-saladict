import { appConfigFactory, AppConfig } from '@/app-config'
import { createActiveConfigStream } from '@/_helpers/config-manager'
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
  [ActionType.NEW_CONFIG]: AppConfig
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export interface ConfigState {
  readonly config: AppConfig
}

export const initState: ConfigState = {
  config: appConfigFactory()
}

/*-----------------------------------------------*\
    Reducer Object
\*-----------------------------------------------*/

type ConfigReducer = {
  [k in ActionType]: (state: StoreState, payload: ConfigPayload[k]) => StoreState
}

export const reducer: ConfigReducer = {
  [ActionType.NEW_CONFIG] (state, config) {
    return { ...state, config }
  }
}

export default reducer

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

interface Action<T extends ActionType> {
  type: ActionType,
  payload?: ConfigPayload[T]
}

/** When app config is updated */
export function newConfig (config: AppConfig): Action<ActionType.NEW_CONFIG> {
  return { type: ActionType.NEW_CONFIG, payload: config }
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

/** Listen to config change and update config */
export function startUpAction (): DispatcherThunk {
  return dispatch => {
    createActiveConfigStream().subscribe(config => {
      dispatch(newConfig(config))
      // first widget then dicts so that the panel rect is re-calculated
      dispatch(newConfigWidget())
      dispatch(newConfigDicts())
    })
  }
}
