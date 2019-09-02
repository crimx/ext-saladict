import { StoreActionHandler } from '..'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'
import { Mutable } from '@/typings/helpers'

export const newSelection: StoreActionHandler<'NEW_SELECTION'> = (
  state,
  { payload: selection }
) => {
  // Skip selection inside panel
  if (selection.self) return state

  const { config, selection: lastSelection } = state

  const newState: Mutable<typeof state> = {
    ...state,
    selection: selection.word
      ? selection
      : {
          ...selection,
          // keep in same position so that
          // hide animation won't float around
          mouseX: lastSelection.mouseX,
          mouseY: lastSelection.mouseY
        }
  }

  if (selection.word) {
    newState.text = selection.word.text

    newState.dictPanelCoord = {
      mouseX: selection.mouseX,
      mouseY: selection.mouseY
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
