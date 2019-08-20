import { Init } from '../utils/types'
import { addConfigListener } from '@/_helpers/config-manager'
import { addActiveProfileListener } from '@/_helpers/profile-manager'
import { isPopupPage, isQuickSearchPage } from '@/_helpers/saladict'
import { StoreActionCatalog, StoreState } from '.'
import { message } from '@/_helpers/browser-api'

export const init: Init<StoreActionCatalog, StoreState> = (
  dispatch,
  getState
) => {
  addConfigListener(({ newConfig }) => {
    dispatch({ type: 'NEW_CONFIG', payload: newConfig })
  })

  addActiveProfileListener(({ newProfile }) => {
    dispatch({ type: 'NEW_PROFILE', payload: newProfile })
  })

  if (isPopupPage()) {
    const { baPreload, baAuto } = getState().config
    dispatch(summonedPanelInit(baPreload, baAuto, 'popup'))
  } else if (isQuickSearchPage()) {
    /** From other tabs */
    message.addListener('QS_PANEL_SEARCH_TEXT', ({ payload }) => {
      dispatch({ type: 'SEARCH_START', payload: { word: payload } })
      // focus standalone panel
      message.send({ type: 'OPEN_QS_PANEL' })
    })
  }
}
