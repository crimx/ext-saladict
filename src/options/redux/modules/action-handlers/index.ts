import { ActionHandlers, ActionHandler } from 'retux'
import { State } from '../state'
import { ActionCatalog } from '../action-catalog'

const stateUpdater = (
  key: keyof State
): ActionHandler<State, ActionCatalog, keyof ActionCatalog> => (
  state,
  { payload }
) => ({
  ...state,
  [key]: payload
})

export const actionHandlers: ActionHandlers<State, ActionCatalog> = {
  NEW_CONFIG: stateUpdater('config'),
  NEW_PROFILES: stateUpdater('profiles'),
  NEW_ACTIVE_PROFILE: stateUpdater('activeProfile'),
  UPLOAD_STATUS: stateUpdater('uploadStatus')
}
