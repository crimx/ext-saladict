import * as recordManager from '@/_helpers/record-manager'
import { StoreState } from './index'
import { TCDirection, AppConfig } from '@/app-config'
import { message, storage } from '@/_helpers/browser-api'
import { MsgSelection, MsgType } from '@/typings/message'
import { searchText, restoreDicts } from '@/content/redux/modules/dictionaries'
import { sendEmptySelection, newSelection } from '@/content/redux/modules/selection'
import { getDefaultSelectionInfo, SelectionInfo } from '@/_helpers/selection'

const isSaladictOptionsPage = Boolean(window['__SALADICT_OPTIONS_PAGE__'])
const isSaladictInternalPage = Boolean(window['__SALADICT_INTERNAL_PAGE__'])
const isSaladictPopupPage = Boolean(window['__SALADICT_POPUP_PAGE__'])

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

export const enum Actions {
  RESTORE = 'widget/RESTORE',
  PIN = 'widget/PIN',
  FAV_WORD = 'widget/FAV_WORD',
  BOWL_SHOW = 'widget/BOWL_SHOW',
  PANEL_SHOW = 'widget/PANEL_SHOW',
  PANEL_APPEAR = 'widget/PANEL_APPEAR',
  WORD_EDITOR_SHOW = 'widget/WORD_EDITOR_SHOW',
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
  readonly shouldWordEditorShow: boolean
}

const initState: WidgetState = {
  isPinned: false,
  isFav: false,
  shouldBowlShow: false,
  isPanelAppear: false,
  shouldPanelShow: false,
  shouldWordEditorShow: false,
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
    case Actions.WORD_EDITOR_SHOW:
      return state.shouldWordEditorShow === action.payload &&
          state.isPinned === action.payload &&
          state.shouldPanelShow === action.payload
        ? state
        : {
          ...state,
          shouldWordEditorShow: action.payload,
          isPinned: action.payload,
          shouldPanelShow: action.payload
        }
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

export function wordEditorShouldShow (payload: boolean): Action {
  return ({ type: Actions.WORD_EDITOR_SHOW, payload })
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

    if (!isSaladictInternalPage) {
      listenNewConfig(dispatch, getState)
      listenTripleCtrl(dispatch, getState)
    }

    if (isSaladictPopupPage) {
      popupPageInit(dispatch, getState)
    }

    // close panel on esc
    message.self.addListener(MsgType.EscapeKey, () => {
      dispatch(closePanel() as any)
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
    if (!isSaladictOptionsPage) {
      dispatch(restoreWidget())
      dispatch(sendEmptySelection() as any)
    }
    message.send({ type: MsgType.PlayAudio, src: '' })
  }
}

export function isInNotebook (info: SelectionInfo): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.isInNotebook(info)
      .then(isInNotebook => dispatch(favWord(isInNotebook)))
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
        dispatch(favWord(false))
      })
  }
}

export function openWordEditor (): Dispatcher {
  return (dispatch, getState) => {
    const state = getState()
    dispatch(wordEditorShouldShow(true))
    dispatch(newSelection({
      type: MsgType.Selection,
      selectionInfo: state.dictionaries.searchHistory[0],
      mouseX: 40,
      mouseY: (1 - state.config.panelMaxHeightRatio) * window.innerHeight / 2,
      dbClick: false,
      ctrlKey: false,
      force: true,
    }) as any)
  }
}

export function closeWordEditor (): Dispatcher {
  return (dispatch, getState) => {
    dispatch(wordEditorShouldShow(false))
  }
}

export function addToNotebook (info: SelectionInfo): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.saveWord('notebook', info)
      .then(() => dispatch(favWord(true)))
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
        dispatch(favWord(false))
      })
  }
}

export function removeFromNotebook (word: recordManager.Word): Dispatcher {
  return (dispatch, getState) => {
    return recordManager.deleteWord('notebook', word)
      .then(() => dispatch(favWord(false)))
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
        dispatch(favWord(false))
      })
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

function listenNewConfig (
  dispatch: (action: Action) => any,
  getState: () => StoreState,
) {
  storage.addListener<AppConfig>('config', ({ config }) => {
    if (config.newValue && !config.newValue.active) {
      dispatch(restoreWidget())
    }
  })
}

function listenNewSelection (
  dispatch: (action: any) => any,
  getState: () => StoreState,
) {
  message.self.addListener<MsgSelection>(MsgType.Selection, message => {
    clearTimeout(panelToggleTimeout)
    clearTimeout(panelSearchTimeout)

    const state = getState()

    if (!isSaladictInternalPage && !state.config.active) {
      return
    }

    const { direct, ctrl, double, icon } = state.config.mode
    const { selectionInfo, dbClick, ctrlKey } = message
    const {
      isPinned,
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
      )) ||
      isSaladictOptionsPage ||
      isSaladictPopupPage
    )

    const isPanelAppear = shouldPanelShow && !lastShouldPanelShow

    const shouldBowlShow = Boolean(
      selectionInfo.text &&
      icon &&
      !shouldPanelShow &&
      !direct &&
      !(double && dbClick) &&
      !(ctrl && ctrlKey) &&
      !isSaladictOptionsPage &&
      !isSaladictPopupPage
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
        ) ||
        isSaladictOptionsPage
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

function popupPageInit (
  dispatch: (action: any) => any,
  getState: () => StoreState,
) {
  const state = getState()
  const {
    baAuto,
    baPreload,
  } = state.config

  if (baPreload) {
    const fetchInfo = (
      baPreload === 'selection'
      ? message.send({ type: MsgType.__PreloadSelection__ })
      : message.send({ type: MsgType.GetClipboard })
    )
    .then(text => {
      const info = getDefaultSelectionInfo({ text })
      dispatch(newSelection({
        type: MsgType.Selection,
        selectionInfo: info,
        mouseX: 0,
        mouseY: 0,
        dbClick: false,
        ctrlKey: false,
        force: true,
      }))
      dispatch(panelShouldShow(true))

      if (baAuto && info.text) {
        dispatch(searchText({ info }))
      } else {
        dispatch(restoreDicts())
      }
    })
  }
}
