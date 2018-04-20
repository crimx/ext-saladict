import { appConfigFactory, AppConfig } from '@/app-config'
import { addAppConfigListener } from '@/_helpers/config-manager'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  NEW_CONFIG = 'configs/NEW_CONFIG'
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type ConfigState = AppConfig

export default function reducer (state = appConfigFactory(), action): ConfigState {
  switch (action.type) {
    case Actions.NEW_CONFIG:
      return action.payload
    default:
      return state
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

/** When app config is updated */
export const newConfig = config => ({ type: Actions.NEW_CONFIG, payload: config })

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

export function listenConfig () {
  return dispatch => {
    addAppConfigListener(({ config }) => dispatch(newConfig(config)))
  }
}
