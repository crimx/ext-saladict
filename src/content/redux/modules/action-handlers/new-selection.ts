import { ActionHandler } from 'retux'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'
import { Mutable } from '@/typings/helpers'
import { State } from '../state'
import { ActionCatalog } from '../action-catalog'

export const newSelection: ActionHandler<
  State,
  ActionCatalog,
  'NEW_SELECTION'
> = (state, { payload: selection }) => {
  // Skip selection inside panel
  if (selection.self) return state

  const { config } = state

  const newState: Mutable<typeof state> = {
    ...state,
    selection
  }

  if (isOptionsPage()) {
    return newState
  }

  if (selection.word) {
    if (selection.force) {
      newState.dictPanelCoord = {
        x: selection.mouseX,
        y: selection.mouseY
      }
    } else if (!state.isPinned) {
      newState.text = selection.word.text

      // icon position       10px  panel position
      //           +-------+      +------------------------+
      //           |       |      |                        |
      //           |       | 30px |                        |
      //      50px +-------+      |                        |
      //           |  30px        |                        |
      //     20px  |              |                        |
      //     +-----+              |                        |
      // cursor
      const iconWidth = 30
      const scrollbarWidth = 10

      newState.bowlCoord = {
        x: selection.mouseX + config.bowlOffsetX,
        y: selection.mouseY + config.bowlOffsetY
      }

      if (newState.bowlCoord.x < 30) {
        newState.bowlCoord.x = 30
      } else if (
        newState.bowlCoord.x + iconWidth + 30 + scrollbarWidth >
        window.innerWidth
      ) {
        newState.bowlCoord.x =
          window.innerWidth - iconWidth - scrollbarWidth - 30
      }

      if (newState.bowlCoord.y < 30) {
        newState.bowlCoord.y = 30
      } else if (newState.bowlCoord.y + iconWidth + 30 > window.innerHeight) {
        newState.bowlCoord.y = window.innerHeight - iconWidth - 30
      }

      newState.dictPanelCoord = {
        x: newState.bowlCoord.x + iconWidth + 10,
        y: newState.bowlCoord.y
      }

      if (
        newState.dictPanelCoord.x + newState.config.panelWidth + 20 >
        window.innerWidth
      ) {
        // right overflow
        newState.dictPanelCoord.x =
          newState.bowlCoord.x - 10 - newState.config.panelWidth
      }
    }
  }

  if ((state.withQSPanel && config.tripleCtrlPageSel) || isStandalonePage()) {
    return newState
  }

  const isActive = config.active && !state.isTempDisabled

  const { direct, holding, double, icon } = config.mode

  newState.isShowDictPanel = Boolean(
    state.isPinned ||
      (isActive &&
        selection.word &&
        selection.word.text &&
        (state.isShowDictPanel ||
          direct ||
          (double && selection.dbClick) ||
          (holding.shift && selection.shiftKey) ||
          (holding.ctrl && selection.ctrlKey) ||
          (holding.meta && selection.metaKey) ||
          selection.instant)) ||
      isStandalonePage()
  )

  newState.isShowBowl = Boolean(
    isActive &&
      selection.word &&
      selection.word.text &&
      icon &&
      !newState.isShowDictPanel &&
      !direct &&
      !(double && selection.dbClick) &&
      !(holding.shift && selection.shiftKey) &&
      !(holding.ctrl && selection.ctrlKey) &&
      !(holding.meta && selection.metaKey) &&
      !selection.instant &&
      !isStandalonePage()
  )

  return newState
}

export default newSelection
