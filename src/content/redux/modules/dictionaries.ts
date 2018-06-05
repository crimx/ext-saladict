import { message } from '@/_helpers/browser-api'
import { DictID, appConfigFactory, AppConfig } from '@/app-config'
import isEqual from 'lodash/isEqual'
import { saveWord } from '@/_helpers/record-manager'
import { getDefaultSelectionInfo, SelectionInfo, isSameSelection } from '@/_helpers/selection'
import { createAppConfigStream } from '@/_helpers/config-manager'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { MsgType, MsgFetchDictResult } from '@/typings/message'
import { StoreState, DispatcherThunk, Dispatcher } from './index'
import { isInNotebook } from './widget'

const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__

/*-----------------------------------------------*\
    Action Type
\*-----------------------------------------------*/

export const enum ActionType {
  NEW_CONFIG = 'dicts/NEW_CONFIG',
  SEARCH_START = 'dicts/SEARCH_START',
  SEARCH_END = 'dicts/SEARCH_END',
  RESTORE = 'dicts/RESTORE',
  ADD_HISTORY = 'dicts/ADD_HISTORY',
}

/*-----------------------------------------------*\
    Payload
\*-----------------------------------------------*/

interface DictionariesPayload {
  [ActionType.NEW_CONFIG]: AppConfig
  [ActionType.RESTORE]: undefined
  [ActionType.ADD_HISTORY]: SelectionInfo
  [ActionType.SEARCH_START]: {
    toOnhold: DictID[]
    toStart: DictID[]
    toActive?: DictID[]
    info: SelectionInfo
  }
  [ActionType.SEARCH_END]: {
    id: DictID
    info: SelectionInfo
    result: any
  }
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export const enum SearchStatus {
  OnHold,
  Searching,
  Finished,
}

type DictState = {
  readonly searchStatus: SearchStatus
  readonly searchResult: any
}

export type DictionariesState = {
  readonly dictionaries: {
    readonly selected: AppConfig['dicts']['selected']
    readonly active: DictID[]
    readonly dicts: {
      readonly [k in DictID]?: DictState
    }
    readonly searchHistory: SelectionInfo[]
  }
}

const initConfig = appConfigFactory()

export const initState: DictionariesState = {
  dictionaries: {
    selected: initConfig.dicts.selected,
    active: [],
    dicts: initConfig.dicts.selected
      .reduce((state, id) => {
        state[id] = {
          searchStatus: SearchStatus.OnHold,
          searchResult: null,
        }
        return state
      }, {}),
    searchHistory: [],
  }
}

/*-----------------------------------------------*\
    Reducer Object
\*-----------------------------------------------*/

type DictsReducer = {
  [k in ActionType]: (state: StoreState, payload: DictionariesPayload[k]) => StoreState
}

export const reducer: DictsReducer = {
  [ActionType.NEW_CONFIG] (state, config) {
    const { dictionaries } = state
    const { selected } = config.dicts

    if (isEqual(selected, dictionaries.selected)) {
      return state
    }

    return {
      ...state,
      dictionaries: {
        ...dictionaries,
        selected,
        active: [],
        dicts: selected.reduce((newState, id) => {
          newState[id] = dictionaries.dicts[id] || {
            searchStatus: SearchStatus.OnHold,
            searchResult: null,
          }
          return newState
        }, {}),
      }
    }
  },
  [ActionType.RESTORE] (state) {
    const { dictionaries } = state
    return {
      ...state,
      dictionaries: {
        ...dictionaries,
        dicts: Object.keys(dictionaries.dicts).reduce((newDicts, id) => {
          newDicts[id] =
            dictionaries.dicts[id].searchStatus === SearchStatus.OnHold
              ? dictionaries.dicts[id]
              : {
                searchStatus: SearchStatus.OnHold,
                searchResult: null,
              }
          return newDicts
        }, {})
      }
    }
  },
  [ActionType.SEARCH_START] (state, { toStart, toOnhold, toActive, info }) {
    const { dictionaries } = state
    const history = dictionaries.searchHistory

    const dicts = { ...dictionaries.dicts }
    toOnhold.forEach(id => {
      if (dicts[id]) {
        dicts[id] = {
          ...dicts[id],
          searchStatus: SearchStatus.OnHold,
          searchResult: null,
        }
      }
    })
    toStart.forEach(id => {
      if (dicts[id]) {
        dicts[id] = {
          ...dicts[id],
          searchStatus: SearchStatus.Searching,
          searchResult: null,
        }
      }
    })

    return {
      ...state,
      dictionaries: {
        ...dictionaries,
        active: toActive || dictionaries.active,
        // don't create history for same info
        searchHistory: info === history[0]
          ? history
          : isSameSelection(info, history[0])
            ? [info, ...history.slice(1, 20)]
            : [info, ...history].slice(0, 20),
        dicts,
      }
    }
  },
  [ActionType.SEARCH_END] (state, { id, info, result }) {
    const { dictionaries } = state

    if (!isSameSelection(info, dictionaries.searchHistory[0])) {
      // ignore the outdated selection
      return state
    }

    return {
      ...state,
      dictionaries: {
        ...dictionaries,
        dicts: {
          ...dictionaries.dicts,
          [id]: { ...dictionaries[id], searchStatus: SearchStatus.Finished, searchResult: result }
        }
      }
    }
  },
  [ActionType.ADD_HISTORY] (state, info) {
    const history = state.dictionaries.searchHistory
    return {
      ...state,
      dictionaries: {
        ...state.dictionaries,
        searchHistory: [info, ...history].slice(0, 20)
      }
    }
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

interface Action<T extends ActionType> {
  type: ActionType,
  payload?: DictionariesPayload[T]
}

export function newConfig (config: AppConfig): Action<ActionType.NEW_CONFIG> {
  return ({ type: ActionType.NEW_CONFIG, payload: config })
}

export function restoreDicts (): Action<ActionType.RESTORE> {
  return ({ type: ActionType.RESTORE })
}

/** Search all selected dicts if id is not provided */
export function searchStart (
  payload: DictionariesPayload[ActionType.SEARCH_START]
): Action<ActionType.SEARCH_START> {
  return ({ type: ActionType.SEARCH_START, payload })
}

export function searchEnd (
  payload: DictionariesPayload[ActionType.SEARCH_END]
): Action<ActionType.SEARCH_END> {
  return ({ type: ActionType.SEARCH_END, payload })
}

export function addSearchHistory (
  payload: DictionariesPayload[ActionType.ADD_HISTORY]
): Action<ActionType.ADD_HISTORY> {
  return ({ type: ActionType.ADD_HISTORY, payload })
}

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

export function startUpAction (): DispatcherThunk {
  return (dispatch, getState) => {
    createAppConfigStream().subscribe(config => {
      dispatch(newConfig(config))
      if (isSaladictPopupPage) {
        popupPageInit(dispatch, getState)
      }
    })

    if (!isSaladictPopupPage && !isSaladictOptionsPage) {
      listenTrpleCtrl(dispatch, getState)
    }

    if (isSaladictOptionsPage) {
      dispatch(searchText({ info: getDefaultSelectionInfo({ text: 'salad' }) }))
    }
  }
}

/**
 * Search all selected dicts if id is not provided.
 * Use last selection if info is not provided.
 */
export function searchText (arg?: { id?: DictID, info?: SelectionInfo }): DispatcherThunk {
  return (dispatch, getState) => {
    const state = getState()
    const info = arg
    ? arg.info || state.dictionaries.searchHistory[0]
    : state.dictionaries.searchHistory[0]

    // try to unfold a dict when the panel first popup
    if (!info || !info.text) { return }

    if (isSaladictOptionsPage) {
      window.__SALADICT_LAST_SEARCH__ = info.text
    }

    dispatch(isInNotebook(info))

    const requestID = arg && arg.id

    // search one dict, when user clicks the unfold arrow
    if (requestID) {
      dispatch(searchStart({ toStart: [requestID], toOnhold: [], info }))
      doSearch(requestID)
      return
    }

    // search all, except the default onholded
    // and those who don't match the selection language
    const { selected: selectedDicts, all: allDicts } = state.config.dicts
    const toStart: DictID[] = []
    const toOnhold: DictID[] = []
    const toActive: DictID[] = []

    selectedDicts.forEach(id => {
      const isInvalidLang = (
        (!allDicts[id].selectionLang.chs && isContainChinese(info.text)) ||
        (!allDicts[id].selectionLang.eng && isContainEnglish(info.text))
      )

      if (!isInvalidLang) {
        toActive.push(id)
      }

      if (!allDicts[id].defaultUnfold || isInvalidLang) {
        toOnhold.push(id)
      } else {
        toStart.push(id)
      }
    })

    dispatch(searchStart({ toStart, toOnhold, toActive, info }))
    toStart.forEach(doSearch)

    if (!isSaladictInternalPage &&
        state.config.searhHistory &&
        !isSameSelection(state.config.searhHistory[0], info)
    ) {
      saveWord('history', info)
    }

    function doSearch (id: DictID) {
      const msg: MsgFetchDictResult = {
        type: MsgType.FetchDictResult,
        id,
        text: info.text
      }
      return message.send(msg)
        .then(result => {
          dispatch(searchEnd({ id, info, result }))
        })
        .catch(() => {
          dispatch(searchEnd({ id, info , result: null }))
        })
    }
  }
}

function listenTrpleCtrl (
  dispatch: Dispatcher,
  getState: () => StoreState,
) {
  message.self.addListener(MsgType.TripleCtrl, () => {
    const state = getState()
    const { tripleCtrlPreload, tripleCtrlAuto } = state.config

    const fetchInfo = tripleCtrlPreload === 'selection'
      ? Promise.resolve({ ...state.selection.selectionInfo })
      : tripleCtrlPreload === 'clipboard'
        ? message.send({ type: MsgType.GetClipboard })
            .then(text => getDefaultSelectionInfo({ text, title: 'From Clipboard' }))
        : Promise.resolve(getDefaultSelectionInfo())

    fetchInfo.then(info => {
      if (tripleCtrlAuto && info.text) {
        dispatch(searchText({ info }))
      } else {
        dispatch(restoreDicts())
        dispatch(addSearchHistory(info))
      }
    })
  })
}

function popupPageInit (
  dispatch: Dispatcher,
  getState: () => StoreState,
) {
  const state = getState()
  const {
    baAuto,
    baPreload,
  } = state.config

  if (baPreload) {
    const fetchInfo = baPreload === 'selection'
        ? message.send({ type: MsgType.__PreloadSelection__ })
        : message.send({ type: MsgType.GetClipboard })
          .then(text => getDefaultSelectionInfo({ text, title: 'From Clipboard' }))

    fetchInfo.then(info => {
      if (baAuto && info.text) {
        dispatch(searchText({ info }))
      } else {
        dispatch(restoreDicts())
        dispatch(addSearchHistory(info))
      }
    })
  }
}
