import { ActionHandler } from 'retux'
import { State } from '../state'
import { ActionCatalog } from '../action-catalog'

export const openQSPanel: ActionHandler<
  State,
  ActionCatalog,
  'OPEN_QS_PANEL'
> = state => {
  const { panelWidth, tripleCtrl, qsLocation } = state.config

  if (!tripleCtrl || state.isShowDictPanel) {
    return state
  }

  let x = 10
  let y = 10

  switch (qsLocation) {
    case 'CENTER':
      x = (window.innerWidth - panelWidth) / 2
      y = window.innerHeight * 0.3
      break
    case 'TOP':
      x = (window.innerWidth - panelWidth) / 2
      y = 10
      break
    case 'RIGHT':
      x = window.innerWidth - panelWidth - 30
      y = window.innerHeight * 0.3
      break
    case 'BOTTOM':
      x = (window.innerWidth - panelWidth) / 2
      y = window.innerHeight - 10
      break
    case 'LEFT':
      x = 10
      y = window.innerHeight * 0.3
      break
    case 'TOP_LEFT':
      x = 10
      y = 10
      break
    case 'TOP_RIGHT':
      x = window.innerWidth - panelWidth - 30
      y = 10
      break
    case 'BOTTOM_LEFT':
      x = 10
      y = window.innerHeight - 10
      break
    case 'BOTTOM_RIGHT':
      x = window.innerWidth - panelWidth - 30
      y = window.innerHeight - 10
      break
  }

  return {
    ...state,
    isQSPanel: true,
    isShowDictPanel: true,
    dictPanelCoord: { x, y }
  }
}

export default openQSPanel
