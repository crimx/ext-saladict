import * as recordManager from '@/_helpers/record-manager'
import { StoreState } from './index'
import { message } from '@/_helpers/browser-api'
import { MsgSelection, MsgType } from '@/typings/message'
import { searchText } from '@/content/redux/modules/dictionaries'
import { sendEmptySelection } from '@/content/redux/modules/selection'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  RESTORE = 'widget/RESTORE',
  PIN = 'widget/PIN',
  FAV_WORD = 'dicts/FAV_WORD',
  BOWL_SHOW = 'disct/BOWL_SHOW',
  PANEL_SHOW = 'disct/PANEL_SHOW',
  PANEL_APPEAR = 'disct/PANEL_APPEAR',
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type WidgetState = {
  readonly isPinned: boolean
  readonly isFav: boolean
  readonly shouldBowlShow: boolean
  readonly isPanelAppear: boolean
  readonly shouldPanelShow: boolean
}

const initState: WidgetState = {
  isPinned: false,
  isFav: false,
  shouldBowlShow: false,
  isPanelAppear: false,
  shouldPanelShow: false,
}

export default function reducer (state = initState, action): WidgetState {
  switch (action.type) {
    case Actions.RESTORE:
      return {
        ...state,
        isPinned: false,
        shouldPanelShow: false,
        shouldBowlShow: false,
        isPanelAppear: false
      }
    case Actions.PIN:
      return { ...state, isPinned: !state.isPinned }
    case Actions.FAV_WORD:
      return state.isFav === action.payload
        ? state
        : { ...state, isFav: action.payload }
    case Actions.PANEL_SHOW:
      return { ...state, shouldPanelShow: action.payload }
    case Actions.BOWL_SHOW:
      return { ...state, shouldBowlShow: action.payload }
    case Actions.PANEL_APPEAR:
      return { ...state, isPanelAppear: action.payload }
    default:
      return state
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

type Action = { type: Actions, payload?: any }

export function restoreWidget (): Action {
  return ({ type: Actions.RESTORE })
}

export function favWord (payload: boolean): Action {
  return ({ type: Actions.FAV_WORD, payload })
}

export function panelPinSwitch (): Action {
  return { type: Actions.PIN }
}

export function panelShouldShow (payload: boolean): Action {
  return ({ type: Actions.PANEL_SHOW, payload })
}

export function panelAppear (payload: boolean): Action {
  return ({ type: Actions.PANEL_APPEAR, payload })
}

export function bowlShouldShow (payload: boolean): Action {
  return ({ type: Actions.BOWL_SHOW, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

type Dispatcher = (
  dispatch: (action: Action) => any,
  getState: () => StoreState,
) => any

let panelToggleTimeout
let panelSearchTimeout
/** Listen to selection change and determine whether to show bowl and panel */
export function startUpAction (): Dispatcher {
  return (dispatch, getState) => {
    message.self.addListener<MsgSelection>(MsgType.Selection, message => {
      clearTimeout(panelToggleTimeout)
      clearTimeout(panelSearchTimeout)

      const state = getState()
      const { direct, ctrl, double, icon } = state.config.mode
      const { selectionInfo, dbClick, ctrlKey } = message
      const {
        isPinned,
        isFav,
        shouldPanelShow: lastShouldPanelShow,
        isPanelAppear: lastIsPanelAppear,
        shouldBowlShow: lastShouldBowlShow,
      } = state.widget

      const shouldPanelShow = Boolean(
        isPinned ||
        (selectionInfo.text && (
          (icon && lastShouldPanelShow) ||
          direct ||
          (double && dbClick) ||
          (ctrl && ctrlKey)
        ))
      )

      const isPanelAppear = shouldPanelShow && !lastShouldPanelShow

      const shouldBowlShow = Boolean(
        selectionInfo.text &&
        icon &&
        !shouldPanelShow &&
        !direct &&
        !(double && dbClick) &&
        !(ctrl && ctrlKey)
      )

      if (isPanelAppear !== lastIsPanelAppear) {
        dispatch(panelAppear(isPanelAppear))
      }

      if (shouldBowlShow !== lastShouldBowlShow) {
        dispatch(bowlShouldShow(shouldBowlShow))
      }

      if (shouldPanelShow !== lastShouldPanelShow) {
        // debounce panel hiding to reduce flickering
        if ((icon || direct || double) && lastShouldPanelShow) {
          panelToggleTimeout = setTimeout(() => {
            dispatch(panelShouldShow(shouldPanelShow))
          }, state.config.doubleClickDelay)
        } else { // show
          dispatch(panelShouldShow(shouldPanelShow))
        }
      }

      // should search text?
      const { pinMode } = state.config
      if (shouldPanelShow &&
          selectionInfo.text && (
            (isPinned && (
              pinMode.direct ||
              (pinMode.double && dbClick) ||
              (pinMode.ctrl && ctrlKey)
            )) ||
            (!isPinned && (
              (icon && lastShouldPanelShow) ||
              direct ||
              (double && dbClick) ||
              (ctrl && ctrlKey)
            ))
          )
      ) {
        // debounce searching
        panelSearchTimeout = setTimeout(() => {
          dispatch(searchText({ info: selectionInfo }) as any)
        }, state.config.doubleClickDelay)
      }
    })
  }
}

export function mouseOnBowl (payload: boolean): Dispatcher {
  return (dispatch, getState) => {
    const state = getState()
    if (payload) {
      if (!state.widget.shouldPanelShow) {
        dispatch(panelShouldShow(true))
        dispatch(searchText({ info: state.selection.selectionInfo }) as any)
      }
    } else { // mouse leave
      if (state.widget.shouldPanelShow) {
        dispatch(bowlShouldShow(false))
      }
    }
  }
}

export function closePanel (): Dispatcher {
  return (dispatch, getState) => {
    dispatch(restoreWidget())
    dispatch(sendEmptySelection() as any)
  }
}

export function addToNotebook (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.addToNotebook(getState().dictionaries.searchHistory[0])
      .then(() => dispatch(favWord(true)))
  }
}

export function removeFromNotebook (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.removeFromNotebook(getState().dictionaries.searchHistory[0])
      .then(() => dispatch(favWord(false)))
  }
}

/** Fire when panel is loaded */
export function updateFaveInfo (): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.isInNotebook(getState().dictionaries.searchHistory[0])
      .then(flag => dispatch(favWord(flag)))
  }
}
