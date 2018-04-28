import * as recordManager from '@/_helpers/record-manager'
import { StoreState } from './index'
import { TCDirection } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { MsgSelection, MsgType } from '@/typings/message'
import { searchText, restoreDicts } from '@/content/redux/modules/dictionaries'
import { sendEmptySelection, newSelection } from '@/content/redux/modules/selection'
import { getDefaultSelectionInfo } from '@/_helpers/selection'

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
    listenNewSelection(dispatch, getState)
    listenTripleCtrl(dispatch, getState)
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

/*-----------------------------------------------*\
    Helpers
\*-----------------------------------------------*/

function listenNewSelection (
  dispatch: (action: any) => any,
  getState: () => StoreState,
) {
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
        lastShouldPanelShow ||
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
      if ((icon || direct || (double && !dbClick)) && lastShouldPanelShow) {
        panelToggleTimeout = setTimeout(() => {
          dispatch(panelShouldShow(shouldPanelShow))
        }, state.config.doubleClickDelay)
      } else { // show
        dispatch(panelShouldShow(shouldPanelShow))
      }
    }

    // should search text?
    const { pinMode } = state.config
    if (isPanelAppear || (
        shouldPanelShow && selectionInfo.text && (
          !isPinned ||
          pinMode.direct ||
          (pinMode.double && dbClick) ||
          (pinMode.ctrl && ctrlKey)
        )
      )
    ) {
      if (dbClick) { // already double click
        dispatch(searchText({ info: selectionInfo }) as any)
      } else {
        // debounce searching
        panelSearchTimeout = setTimeout(() => {
          dispatch(searchText({ info: selectionInfo }) as any)
        }, state.config.doubleClickDelay)
      }
    }
  })
}

function listenTripleCtrl (
  dispatch: (action: any) => any,
  getState: () => StoreState,
) {
  message.self.addListener(MsgType.TripleCtrl, () => {
    const state = getState()
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    const {
      panelWidth,
      tripleCtrl,
      tripleCtrlAuto,
      tripleCtrlLocation,
      tripleCtrlPreload,
    } = state.config

    if (!tripleCtrl || state.widget.shouldPanelShow) { return }

    let mouseX = 10
    let mouseY = 10

    switch (tripleCtrlLocation) {
      case TCDirection.center:
        mouseX = (window.innerWidth - panelWidth) / 2
        mouseY = window.innerHeight * 0.3
        break
      case TCDirection.top:
        mouseX = (window.innerWidth - panelWidth) / 2
        mouseY = 10
        break
      case TCDirection.right:
        mouseX = window.innerWidth - panelWidth - 20
        mouseY = window.innerHeight * 0.3
        break
      case TCDirection.bottom:
        mouseX = (window.innerWidth - panelWidth) / 2
        mouseY = window.innerHeight - 10
        break
      case TCDirection.left:
        mouseX = 10
        mouseY = window.innerHeight * 0.3
        break
      case TCDirection.topLeft:
        mouseX = 10
        mouseY = 10
        break
      case TCDirection.topRight:
        mouseX = window.innerWidth - panelWidth - 20
        mouseY = 10
        break
      case TCDirection.bottomLeft:
        mouseX = 10
        mouseY = window.innerHeight - 10
        break
      case TCDirection.bottomRight:
        mouseX = window.innerWidth - panelWidth - 20
        mouseY = window.innerHeight - 10
        break
    }

    const fetchInfo = tripleCtrlPreload === 'selection'
      ? Promise.resolve({ ...state.selection.selectionInfo })
      : tripleCtrlPreload === 'clipboard'
        ? message.send({ type: MsgType.GetClipboard })
            .then(text => getDefaultSelectionInfo({ text }))
        : Promise.resolve(getDefaultSelectionInfo())

    fetchInfo.then(info => {
      dispatch(newSelection({
        type: MsgType.Selection,
        selectionInfo: info,
        mouseX,
        mouseY,
        dbClick: false,
        ctrlKey: false,
        force: true,
      }))

      dispatch(restoreWidget())
      dispatch(panelShouldShow(true))

      if (tripleCtrlAuto && info.text) {
        dispatch(searchText({ info }))
      } else {
        dispatch(restoreDicts())
      }
    })
  })
}
