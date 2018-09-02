import * as recordManager from '@/_helpers/record-manager'
import { StoreState, DispatcherThunk, Dispatcher } from './index'
import appConfigFactory, { TCDirection, DictID } from '@/app-config'
import { message, storage } from '@/_helpers/browser-api'
import { createConfigIDListStream } from '@/_helpers/config-manager'
import { MsgType, MsgTempDisabledState, MsgEditWord, MsgOpenUrl, MsgFetchDictResult } from '@/typings/message'
import { searchText, restoreDicts } from '@/content/redux/modules/dictionaries'
import { SelectionInfo, getDefaultSelectionInfo } from '@/_helpers/selection'
import { Mutable } from '@/typings/helpers'
import { reflect } from '@/_helpers/promise-more'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'

const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__

const panelHeaderHeight = 30 + 10 // menu bar + multiline search box button

/*-----------------------------------------------*\
    Action Type
\*-----------------------------------------------*/

export const enum ActionType {
  NEW_CONFIG = 'widget/NEW_CONFIG',
  RESTORE = 'widget/RESTORE',
  TRIPLE_CTRL = 'widget/TRIPLE_CTRL',
  TEMP_DISABLED = 'widget/TEMP_DISABLED',
  PIN = 'widget/PIN',
  FAV_WORD = 'widget/FAV_WORD',
  MOUSE_ON_BOWL = 'widget/MOUSE_ON_BOWL',
  NEW_SELECTION = 'widget/NEW_SELECTION',
  EDITOR_WORD_UPDATE = 'widget/EDITOR_WORD_UPDATE',
  NEW_PANEL_HEIGHT = 'widget/NEW_PANEL_HEIGHT',
  PANEL_CORDS = 'widget/PANEL_CORDS',
  CONFIG_PROFILE_lIST = 'widget/CONFIG_PROFILE_lIST',
  SEARCH_BOX_UPDATE = 'dicts/SEARCH_BOX_UPDATE',
}

/*-----------------------------------------------*\
    Payload
\*-----------------------------------------------*/

interface WidgetPayload {
  [ActionType.NEW_CONFIG]: undefined
  [ActionType.RESTORE]: undefined
  [ActionType.TRIPLE_CTRL]: undefined
  [ActionType.TEMP_DISABLED]: boolean
  [ActionType.PIN]: undefined
  [ActionType.FAV_WORD]: boolean
  [ActionType.MOUSE_ON_BOWL]: boolean
  [ActionType.EDITOR_WORD_UPDATE]: SelectionInfo | null
  [ActionType.NEW_SELECTION]: Partial<WidgetState['widget']>
  [ActionType.NEW_PANEL_HEIGHT]: number
  [ActionType.PANEL_CORDS]: { x: number, y: number }
  [ActionType.CONFIG_PROFILE_lIST]: Array<{ id: string, name: string }>
  [ActionType.SEARCH_BOX_UPDATE]: {
    text: string
    index: number
  }
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type WidgetState = {
  readonly widget: {
    readonly isTempDisabled: boolean
    readonly isPinned: boolean
    readonly isFav: boolean
    readonly shouldBowlShow: boolean
    readonly shouldPanelShow: boolean
    readonly panelRect: {
      x: number
      y: number
      width: number
      height: number
    }
    readonly bowlRect: {
      x: number
      y: number
    }
    readonly editorWord: SelectionInfo | null
    readonly panelStateBeforeWordEditor: {
      x: number
      y: number
      isPinned: boolean
      shouldPanelShow: boolean
    }
    readonly configProfiles: Array<{ id: string, name: string }>
    /** index in search history */
    readonly searchBoxIndex: number
    readonly searchBoxText: string
  }
}

const _initConfig = appConfigFactory()

export const initState: WidgetState = {
  widget: {
    isTempDisabled: false,
    isPinned: isSaladictOptionsPage,
    isFav: false,
    shouldBowlShow: false,
    shouldPanelShow: isSaladictPopupPage || isSaladictOptionsPage,
    panelRect: {
      x: isSaladictOptionsPage
        ? window.innerWidth - _initConfig.panelWidth - 30
        : 0,
      y: isSaladictOptionsPage
        ? window.innerHeight * (1 - _initConfig.panelMaxHeightRatio) / 2
        : 0,
      width: isSaladictPopupPage
        ? Math.min(750, _initConfig.panelWidth)
        : _initConfig.panelWidth,
      height: isSaladictPopupPage
        ? 400
        : panelHeaderHeight
    },
    bowlRect: {
      x: 0,
      y: 0,
    },
    editorWord: null,
    panelStateBeforeWordEditor: {
      x: 0,
      y: 0,
      isPinned: false,
      shouldPanelShow: false,
    },
    configProfiles: [],
    searchBoxIndex: 0,
    searchBoxText: '',
  }
}

/*-----------------------------------------------*\
    Reducer Object
\*-----------------------------------------------*/

type WidgetReducer = {
  [k in ActionType]: (state: StoreState, payload: WidgetPayload[k]) => StoreState
}

export const reducer: WidgetReducer = {
  [ActionType.NEW_CONFIG] (state) {
    const { config } = state
    const widget = config.active
      ? { ...state.widget }
      : _restoreWidget(state.widget)

    widget.panelRect = _reconcilePanelRect(
      widget.panelRect.x,
      widget.panelRect.y,
      config.panelWidth,
      widget.panelRect.height,
    )

    const url = window.location.href
    widget.isTempDisabled = (
      config.blacklist.some(([r]) => new RegExp(r).test(url)) &&
      config.whitelist.every(([r]) => !new RegExp(r).test(url))
    )

    return {
      ...state,
      widget,
    }
  },
  [ActionType.RESTORE] (state) {
    return {
      ...state,
      widget: _restoreWidget(state.widget),
    }
  },
  [ActionType.TRIPLE_CTRL] (state) {
    const {
      panelWidth,
      tripleCtrl,
      tripleCtrlLocation,
    } = state.config

    if (!tripleCtrl || state.widget.shouldPanelShow) {
      return state
    }

    let x = 10
    let y = 10

    switch (tripleCtrlLocation) {
      case TCDirection.center:
        x = (window.innerWidth - panelWidth) / 2
        y = window.innerHeight * 0.3
        break
      case TCDirection.top:
        x = (window.innerWidth - panelWidth) / 2
        y = 10
        break
      case TCDirection.right:
        x = window.innerWidth - panelWidth - 30
        y = window.innerHeight * 0.3
        break
      case TCDirection.bottom:
        x = (window.innerWidth - panelWidth) / 2
        y = window.innerHeight - 10
        break
      case TCDirection.left:
        x = 10
        y = window.innerHeight * 0.3
        break
      case TCDirection.topLeft:
        x = 10
        y = 10
        break
      case TCDirection.topRight:
        x = window.innerWidth - panelWidth - 30
        y = 10
        break
      case TCDirection.bottomLeft:
        x = 10
        y = window.innerHeight - 10
        break
      case TCDirection.bottomRight:
        x = window.innerWidth - panelWidth - 30
        y = window.innerHeight - 10
        break
    }

    const widget = _restoreWidget(state.widget)
    const { width, height } = widget.panelRect
    widget.shouldPanelShow = true
    widget.panelRect = _reconcilePanelRect(x, y, width, height)

    return {
      ...state,
      widget,
    }
  },
  [ActionType.TEMP_DISABLED] (state, isTempDisable) {
    const widget = isTempDisable
      ? _restoreWidget(state.widget)
      : { ...state.widget }

    widget.isTempDisabled = isTempDisable

    return {
      ...state,
      widget,
    }
  },
  [ActionType.PIN] (state) {
    return {
      ...state,
      widget: {
        ...state.widget,
        isPinned: !state.widget.isPinned,
      },
    }
  },
  [ActionType.FAV_WORD] (state, flag) {
    if (state.widget.isFav === flag) {
      return state
    }

    return {
      ...state,
      widget: {
        ...state.widget,
        isFav: flag,
      }
    }
  },
  [ActionType.MOUSE_ON_BOWL] (state, isMouseOnBowl) {
    if (isMouseOnBowl) {
      return {
        ...state,
        widget: {
          ...state.widget,
          shouldPanelShow: true,
        }
      }
    }

    return {
      ...state,
      widget: {
        ...state.widget,
        shouldBowlShow: false,
      }
    }
  },
  [ActionType.EDITOR_WORD_UPDATE] (state, editorWord) {
    const oldEditorWord = state.widget.editorWord

    const newState = {
      ...state,
      widget: {
        ...state.widget,
        editorWord,
      }
    }

    if (!oldEditorWord && editorWord) {
      const { panelRect, isPinned, shouldPanelShow } = state.widget
      const { x, y, width, height } = panelRect
      newState.widget.panelStateBeforeWordEditor = {
        x, y,
        isPinned,
        shouldPanelShow,
      }

      newState.widget.isPinned = true
      newState.widget.shouldPanelShow = true
      newState.widget.panelRect = _reconcilePanelRect(
        40,
        (1 - state.config.panelMaxHeightRatio) * window.innerHeight / 2,
        width,
        height,
      )
    } else if (oldEditorWord && !editorWord) {
      // Resume cords
      const { width, height } = state.widget.panelRect
      const { x, y, isPinned, shouldPanelShow } = state.widget.panelStateBeforeWordEditor

      // User might close the panel during word editor page. Keep it closed.
      newState.widget.shouldPanelShow = shouldPanelShow && state.widget.shouldPanelShow
      if (newState.widget.shouldPanelShow) {
        newState.widget.isPinned = isPinned
        newState.widget.panelRect = _reconcilePanelRect(
          x,
          y,
          width,
          height,
        )
      }
    }

    return newState
  },
  [ActionType.NEW_SELECTION] (state, widgetPartial) {
    return {
      ...state,
      widget: {
        ...state.widget,
        ...widgetPartial,
      }
    }
  },
  [ActionType.NEW_PANEL_HEIGHT] (state, newHeight) {
    const { x, y, width } = state.widget.panelRect
    return {
      ...state,
      widget: {
        ...state.widget,
        panelRect: _reconcilePanelRect(
          x,
          y,
          width,
          newHeight,
        ),
      }
    }
  },
  [ActionType.PANEL_CORDS] (state, { x, y }) {
    const { width, height } = state.widget.panelRect
    return {
      ...state,
      widget: {
        ...state.widget,
        panelRect: { x, y, width, height },
      }
    }
  },
  [ActionType.CONFIG_PROFILE_lIST] (state, configProfiles) {
    return {
      ...state,
      widget: {
        ...state.widget,
        configProfiles,
      }
    }
  },
  [ActionType.SEARCH_BOX_UPDATE] (state, { text, index }) {
    return {
      ...state,
      widget: {
        ...state.widget,
        searchBoxText: text,
        searchBoxIndex: index,
      }
    }
  },
}

export default reducer

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

interface Action<T extends ActionType> {
  type: ActionType,
  payload?: WidgetPayload[T]
}

export function newConfig (): Action<ActionType.NEW_CONFIG> {
  return ({ type: ActionType.NEW_CONFIG })
}

export function tempDisable (payload: boolean): Action<ActionType.TEMP_DISABLED> {
  return ({ type: ActionType.TEMP_DISABLED, payload })
}

export function restoreWidget (): Action<ActionType.RESTORE> {
  return ({ type: ActionType.RESTORE })
}

export function tripleCtrlPressed (): Action<ActionType.TRIPLE_CTRL> {
  return ({ type: ActionType.TRIPLE_CTRL })
}

export function panelPinSwitch (): Action<ActionType.PIN> {
  return { type: ActionType.PIN }
}

export function favWord (payload: boolean): Action<ActionType.FAV_WORD> {
  return ({ type: ActionType.FAV_WORD, payload })
}

export function mouseOnBowlAction (payload: boolean): Action<ActionType.MOUSE_ON_BOWL> {
  return ({ type: ActionType.MOUSE_ON_BOWL, payload })
}

export function newSelectionAction (payload: WidgetPayload[ActionType.NEW_SELECTION]): Action<ActionType.NEW_SELECTION> {
  return ({ type: ActionType.NEW_SELECTION, payload })
}

export function updateEditorWord (payload: SelectionInfo | null): Action<ActionType.EDITOR_WORD_UPDATE> {
  return ({ type: ActionType.EDITOR_WORD_UPDATE, payload })
}

export function newPanelHeight (payload: number): Action<ActionType.NEW_PANEL_HEIGHT> {
  return ({ type: ActionType.NEW_PANEL_HEIGHT, payload })
}

export function panelOnDrag (x: number, y: number): Action<ActionType.PANEL_CORDS> {
  return ({ type: ActionType.PANEL_CORDS, payload: { x, y } })
}

export function updateConfigProfiles (payload: WidgetPayload[ActionType.CONFIG_PROFILE_lIST]): Action<ActionType.CONFIG_PROFILE_lIST> {
  return ({ type: ActionType.CONFIG_PROFILE_lIST, payload })
}

export function searchBoxUpdate (payload: WidgetPayload[ActionType.SEARCH_BOX_UPDATE]): Action<ActionType.SEARCH_BOX_UPDATE> {
  return ({ type: ActionType.SEARCH_BOX_UPDATE, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

let dictHeights: Partial<{ [id in (DictID | '_mtabox')]: number }> = {}

export function startUpAction (): DispatcherThunk {
  return (dispatch, getState) => {
    listenTempDisable(dispatch, getState)

    createConfigIDListStream().subscribe(async idlist => {
      const profiles: Array<{ id: string, name: string }> = []
      for (let i = 0; i < idlist.length; i++) {
        const id = idlist[i]
        // beware of quota bytes per item exceeds
        const profile = (await storage.sync.get(id))[id]
        if (profile) {
          profiles.push({ id, name: profile.name })
        } else {
          if (process.env.DEV_BUILD) {
            console.warn(`Update config ID List: id "${id}" not exist`)
          }
        }
      }

      dispatch(updateConfigProfiles(profiles))
    })

    // close panel and word editor on esc
    message.self.addListener(MsgType.EscapeKey, () => {
      dispatch(closePanel())
    })

    // from word page
    message.self.addListener<MsgEditWord>(MsgType.EditWord, ({ word }) => {
      dispatch(searchText({ info: word }))
      dispatch(updateEditorWord(word))
    })
  }
}

export function mouseOnBowl (payload: boolean): DispatcherThunk {
  return (dispatch, getState) => {
    const state = getState()
    if (payload) {
      if (!state.widget.shouldPanelShow) {
        dispatch(mouseOnBowlAction(true))
        dispatch(searchText({ info: state.selection.selectionInfo }))
      }
    } else { // mouse leave
      if (state.widget.shouldPanelShow) {
        dispatch(mouseOnBowlAction(false))
      }
    }
  }
}

export function closePanel (): DispatcherThunk {
  return (dispatch, getState) => {
    if (!isSaladictOptionsPage) {
      dispatch(restoreWidget())
      dispatch(restoreDicts())
    }
    message.send({ type: MsgType.PlayAudio, src: '' })
  }
}

export function isInNotebook (info: SelectionInfo): DispatcherThunk {
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

export function requestFavWord (): DispatcherThunk {
  return (dispatch, getState) => {
    const { config, dictionaries, widget } = getState()
    const word = { ...dictionaries.searchHistory[0], date: Date.now() }
    if (config.editOnFav) {
      if (isSaladictPopupPage) {
        // Not enough space to open word editor on popup page
        try {
          message.send<MsgOpenUrl>({
            type: MsgType.OpenURL,
            url: 'notebook.html?info=' +
              encodeURIComponent(JSON.stringify(word)),
            self: true,
          })
        } catch (err) {
          console.warn(err)
        }
      } else {
        dispatch(updateEditorWord(word))
      }
    } else {
      if (widget.isFav) {
        recordManager.getWordsByText('notebook', word.text)
          .then(words => {
            if (words.length === 1) {
              recordManager.deleteWords('notebook', [words[0].date])
                .then(() => dispatch(favWord(false)))
            } else {
              message.send<MsgOpenUrl>({
                type: MsgType.OpenURL,
                url: 'notebook.html?text=' + encodeURIComponent(word.text),
                self: true,
              })
            }
          })
      } else {
        dispatch(addToNotebook(word))
      }
    }

    if (word.context) {
      const dicts = ['Google', 'Sogou']
      const ids = ['google', 'sogou'] as ['google', 'sogou']
      reflect<MachineTranslateResult>(ids.map(id => message.send<MsgFetchDictResult>({
        type: MsgType.FetchDictResult,
        id,
        text: word.context,
      })))
      .then(results => {
        const trans = results
          .map((result, i) => result && dicts[i] + ': ' + result.trans.text)
          .filter(Boolean)
          .join('\n')
        if (!trans) { return }

        if (config.editOnFav) {
          const editorWord = widget.editorWord || word
          dispatch(updateEditorWord({
            ...editorWord,
            trans: editorWord.trans
              ? editorWord.trans + '\n\n' + trans
              : trans
          }))
        } else {
          dispatch(addToNotebook({ ...word, trans }))
        }
      })
    }
  }
}

export function closeWordEditor (): DispatcherThunk {
  return (dispatch, getState) => {
    dispatch(updateEditorWord(null))
  }
}

export function addToNotebook (info: SelectionInfo | recordManager.Word): DispatcherThunk {
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

export function updateItemHeight (id: DictID | '_mtabox', height: number): DispatcherThunk {
  return (dispatch, getState) => {
    if (isSaladictPopupPage) {
      return
    }

    const state = getState()

    if (dictHeights[id] !== height) {
      dictHeights[id] = height

      const winHeight = window.innerHeight
      const newHeight = Math.min(
        winHeight * state.config.panelMaxHeightRatio,
        panelHeaderHeight +
        (dictHeights._mtabox || 0) +
        state.dictionaries.active
          .reduce((sum, id) => sum + (dictHeights[id] || panelHeaderHeight), 0),
      )

      dispatch(newPanelHeight(newHeight))
    }
  }
}

export function newSelection (): DispatcherThunk {
  return (dispatch, getState) => {
    const state = getState()
    const { selectionInfo, dbClick, ctrlKey, instant, mouseX, mouseY, self } = state.selection

    if (self) {
      // inside dict panel
      const { direct, double, ctrl } = state.config.panelMode
      const { text, context } = selectionInfo
      if (text && (
            instant ||
            direct ||
            (double && dbClick) ||
            (ctrl && ctrlKey)
          )
      ) {
        dispatch(searchText({
          info: getDefaultSelectionInfo({
            text,
            context,
            title: 'Saladict Panel',
            favicon: 'https://raw.githubusercontent.com/crimx/ext-saladict/dev/public/static/icon-16.png',
          })
        }))
      }
      return
    }

    if (isSaladictPopupPage || isSaladictOptionsPage) { return }

    const isActive = state.config.active && !state.widget.isTempDisabled

    const { direct, ctrl, double, icon } = state.config.mode
    const {
      isPinned,
      shouldPanelShow: lastShouldPanelShow,
      panelRect: lastPanelRect,
      bowlRect: lastBowlRect,
    } = state.widget

    const shouldPanelShow = Boolean(
      isPinned ||
      (isActive && selectionInfo.text && (
        lastShouldPanelShow ||
        direct ||
        (double && dbClick) ||
        (ctrl && ctrlKey) ||
        instant
      )) ||
      isSaladictPopupPage
    )

    const shouldBowlShow = Boolean(
      isActive &&
      selectionInfo.text &&
      icon &&
      !shouldPanelShow &&
      !direct &&
      !(double && dbClick) &&
      !(ctrl && ctrlKey) &&
      !instant &&
      !isSaladictPopupPage
    )

    const bowlRect = shouldBowlShow
      ? _getBowlRectFromEvent(mouseX, mouseY)
      : lastBowlRect

    const newWidgetPartial: Mutable<Partial<WidgetState['widget']>> = {
      shouldPanelShow,
      shouldBowlShow,
      bowlRect,
    }

    if (!isPinned && (shouldPanelShow || !lastShouldPanelShow)) {
      dictHeights = {}
      // don't calculate on hiding to prevent moving animation
      newWidgetPartial.panelRect = _getPanelRectFromEvent(
        mouseX,
        mouseY,
        lastPanelRect.width,
        isSaladictPopupPage ? 400 : panelHeaderHeight,
      )
    }

    dispatch(newSelectionAction(newWidgetPartial))

    // should search text?
    const { pinMode } = state.config
    if (shouldPanelShow && selectionInfo.text && (
          !isPinned ||
          pinMode.direct ||
          (pinMode.double && dbClick) ||
          (pinMode.ctrl && ctrlKey)
        )
    ) {
      dispatch(searchText({ info: selectionInfo }))
    } else if (!shouldPanelShow && lastShouldPanelShow) {
      // Everything stays the same if the panel is still visible (e.g. pin mode)
      // Otherwise clean up all dicts
      dispatch(restoreDicts())
    }
  }
}

/*-----------------------------------------------*\
    Helpers
\*-----------------------------------------------*/

/** From popup page */
function listenTempDisable (
  dispatch: Dispatcher,
  getState: () => StoreState,
) {
  message.addListener<MsgTempDisabledState>(MsgType.TempDisabledState, msg => {
    switch (msg.op) {
      case 'get':
        return Promise.resolve(getState().widget.isTempDisabled)
      case 'set':
        if (msg.value) {
          dispatch(restoreWidget())
        }
        dispatch(tempDisable(msg.value))
        return Promise.resolve(true)
      default:
        break
    }
  })
}

/** Returns a fresh restored copy of widget state */
function _restoreWidget (widget: WidgetState['widget']): Mutable<WidgetState['widget']> {
  return {
    ...widget,
    isPinned: isSaladictOptionsPage,
    shouldPanelShow: isSaladictPopupPage || isSaladictOptionsPage,
    shouldBowlShow: false,
    panelRect: {
      ...widget.panelRect,
      height: isSaladictPopupPage ? 400 : panelHeaderHeight,
    },
  }
}

function _reconcilePanelRect (
  x: number,
  y: number,
  width: number,
  height: number,
): WidgetState['widget']['panelRect'] {
  width = width | 0
  height = height | 0

  const winWidth = window.innerWidth
  const winHeight = window.innerHeight

  if (x + width + 10 > winWidth) { x = winWidth - 10 - width }
  if (x < 10) { x = 10 }

  if (y + height + 10 > winHeight) { y = winHeight - 10 - height }
  if (y < 10) { y = 10 }

  return { x, y, width, height }
}

function _getPanelRectFromEvent (
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
): WidgetState['widget']['panelRect'] {
  if (isSaladictPopupPage) {
    return {
      x: 0,
      y: 0,
      width: Math.min(width, 750),
      height: 400,
    }
  }

  const winWidth = window.innerWidth

  // icon position           10px  panel position
  //             +-------+         +------------------------+
  //             |       |         |                        |
  //             |       | 30px    |                        |
  //        60px +-------+         |                        |
  //             |  30px           |                        |
  //             |                 |                        |
  //       40px  |                 |                        |
  //     +-------+                 |                        |
  // cursor
  const x = mouseX + width + 80 <= winWidth ? mouseX + 80 : mouseX - width - 80
  const y = mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
  return _reconcilePanelRect(x, y, width, height)
}

function _getBowlRectFromEvent (mouseX: number, mouseY: number): { x: number, y: number } {
  // icon position
  //             +-------+
  //             |       |
  //             |       | 30px
  //        60px +-------+
  //             |  30px
  //             |
  //       40px  |
  //     +-------+
  // cursor
  return {
    x: mouseX + 70 > window.innerWidth ? mouseX - 70 : mouseX + 40,
    y: mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30,
  }
}
