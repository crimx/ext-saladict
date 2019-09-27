import { StoreActionHandler } from '..'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'
import { Mutable } from '@/typings/helpers'

export const newSelection: StoreActionHandler<'NEW_SELECTION'> = (
  state,
  { payload: selection }
) => {
  // Skip selection inside panel
  if (selection.self) return state

  const { config } = state

  const newState: Mutable<typeof state> = {
    ...state,
    selection
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
      const iconGap = 15
      const scrollbarWidth = 10

      newState.bowlCoord = {
        x:
          selection.mouseX + iconGap + iconWidth >
          window.innerWidth - scrollbarWidth // right overflow
            ? selection.mouseX - iconGap - iconWidth // switch to left
            : selection.mouseX + iconGap,
        y:
          selection.mouseY < iconWidth + iconGap // top overflow
            ? selection.mouseY + iconGap // switch to bottom
            : selection.mouseY - iconWidth - iconGap
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

  if (
    (state.withQSPanel && config.tripleCtrlPageSel) ||
    isStandalonePage() ||
    isOptionsPage()
  ) {
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
