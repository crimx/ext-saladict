import { StoreActionHandler } from '..'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'

export const newSelection: StoreActionHandler<'NEW_SELECTION'> = (
  state,
  { payload }
) => {
  const { selection, config } = state

  const newState = {
    ...state,
    selection: payload,
    dictPanelCord: {
      mouseX: selection.mouseX,
      mouseY: selection.mouseY
    }
  }

  if (
    selection.self ||
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
