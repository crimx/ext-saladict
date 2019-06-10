import { message } from '@/_helpers/browser-api'
import { DictID, PreloadSource } from '@/app-config'
import isEqual from 'lodash/isEqual'
import { saveWord } from '@/_helpers/record-manager'
import { getDefaultSelectionInfo, SelectionInfo, isSameSelection } from '@/_helpers/selection'
import { MsgType, MsgFetchDictResult, MsgQSPanelSearchText, MsgFetchDictResultResponse, MsgAudioPlay } from '@/typings/message'
import getDefaultProfile from '@/app-config/profiles'
import { DeepReadonly } from '@/typings/helpers'
import { StoreState, DispatcherThunk } from './index'
import { isInNotebook, searchBoxUpdate } from './widget'
import {
  countWords,
  checkSupportedLangs,
} from '@/_helpers/lang-check'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'

const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictQuickSearchPage = !!window.__SALADICT_QUICK_SEARCH_PAGE__
const isSaladictPDFPage = !!window.__SALADICT_PDF_PAGE__

const isStandalonePage = isSaladictPopupPage || isSaladictQuickSearchPage
const isNoSearchHistoryPage = isSaladictInternalPage && !isStandalonePage

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
  [ActionType.NEW_CONFIG]: undefined
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
    readonly selected: DeepReadonly<DictID[]>
    readonly active: DictID[]
    readonly dicts: {
      readonly [k in DictID]?: DictState
    }
    // 0 is the latest
    readonly searchHistory: SelectionInfo[]
  }
}

const defaultProfile = getDefaultProfile()

export const initState: DictionariesState = {
  dictionaries: {
    selected: defaultProfile.dicts.selected,
    active: [],
    dicts: defaultProfile.dicts.selected
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
  [ActionType.NEW_CONFIG] (state) {
    const { dictionaries } = state
    const { selected } = state.config.dicts

    if (isEqual(selected, dictionaries.selected)) {
      return state
    }

    return {
      ...state,
      dictionaries: {
        ...dictionaries,
        selected: selected.slice(),
        active: dictionaries.active.filter(id => selected.indexOf(id) !== -1),
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
        active: [],
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
    const { dictionaries, widget } = state
    const searchBoxIndex = widget.searchBox.index || 0
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
        searchHistory: info === dictionaries.searchHistory[searchBoxIndex]
          ? dictionaries.searchHistory
          // don't create history for same info
          : isSameSelection(info, dictionaries.searchHistory[0])
            ? [info, ...dictionaries.searchHistory.slice(1)]
            : [info, ...dictionaries.searchHistory],
        dicts,
      }
    }
  },
  [ActionType.SEARCH_END] (state, { id, info, result }) {
    const { dictionaries, widget } = state

    if (!isSameSelection(info, dictionaries.searchHistory[widget.searchBox.index || 0])) {
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
        searchHistory: [info, ...history]
      }
    }
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

interface Action<T extends ActionType> {
  type: T,
  payload?: DictionariesPayload[T]
}

export function newConfig (): Action<ActionType.NEW_CONFIG> {
  return ({ type: ActionType.NEW_CONFIG })
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
    if (isSaladictPopupPage) {
      const { baPreload, baAuto } = getState().config
      dispatch(summonedPanelInit(baPreload, baAuto, 'popup'))
    } else if (isSaladictQuickSearchPage) {
      /** From other tabs */
      message.addListener<MsgQSPanelSearchText>(MsgType.QSPanelSearchText, ({ info }) => {
        dispatch(searchText({ info }))
        // focus standalone panel
        message.send({ type: MsgType.OpenQSPanel })
      })
    }
  }
}

/**
 * Search all selected dicts if id is not provided.
 * Use last selection if info is not provided.
 */
export function searchText (
  arg?: { id?: DictID, info?: SelectionInfo, payload?: { [index: string]: any } }
): DispatcherThunk {
  return (dispatch, getState) => {
    const state = getState()
    const searchBoxIndex = state.widget.searchBox.index || 0
    const info = arg && arg.info
      ? arg.info
      : state.dictionaries.searchHistory[searchBoxIndex]

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

    const { selected: selectedDicts, all: allDicts } = state.config.dicts
    /** should display */
    const toActive: DictID[] = []
    /** should start searching */
    const toStart: DictID[] = []
    /** reset to folded state */
    const toOnhold: DictID[] = []

    selectedDicts.forEach(id => {
      const dict = allDicts[id]
      let isValidSelection = checkSupportedLangs(dict.selectionLang, info.text)

      if (isValidSelection) {
        const wordCount = countWords(info.text)
        const { min, max } = dict.selectionWC
        isValidSelection = wordCount >= min && wordCount <= max
      }

      if (isValidSelection) {
        toActive.push(id)
      }

      if (isValidSelection && checkSupportedLangs(dict.defaultUnfold, info.text)) {
        toStart.push(id)
      } else {
        toOnhold.push(id)
      }
    })

    if (!isNoSearchHistoryPage &&
        state.config.searhHistory &&
        (!browser.extension.inIncognitoContext || state.config.searhHistoryInco) &&
        !isSameSelection(state.dictionaries.searchHistory[0], info)
    ) {
      saveWord('history', info)
    }

    dispatch(searchStart({ toStart, toOnhold, toActive, info }))
    if (arg && arg.info) {
      // Reset index after search start. Index is useful.
      dispatch(searchBoxUpdate({ text: info.text, index: 0 }))
    }

    const pSearchResponses = toStart.map(doSearch)

    // dict with auto pronunciation but not searching
    const autopronChs = state.config.autopron.cn.dict
    if (autopronChs && !toStart.includes(autopronChs)) {
      pSearchResponses.push(requestDictResult(autopronChs))
    } else {
      const autopronEng = state.config.autopron.en.dict
      if (autopronEng && !toStart.includes(autopronEng)) {
        pSearchResponses.push(requestDictResult(autopronEng))
      }
    }

    // handle auto pronunciation
    let hasPlayed = false
    for (const pSearchResponse of pSearchResponses) {
      pSearchResponse.then(({ id, result, audio }) => {
        if (hasPlayed) { return }

        const { cn, en, machine } = state.config.autopron

        if (audio) {
          if (id === cn.dict && audio.py) {
            message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src: audio.py })
            hasPlayed = true
            return
          }

          if (id === en.dict) {
            const src = en.accent === 'us'
              ? audio!.us || audio!.uk
              : audio!.uk || audio!.us
            if (src) {
              message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
              hasPlayed = true
              return
            }
          }
        }

        if (id === machine.dict) {
          const src = (result as MachineTranslateResult<DictID>)[machine.src].audio
          if (src) {
            message.send<MsgAudioPlay>({ type: MsgType.PlayAudio, src })
            hasPlayed = true
            return
          }
        }
      })
    }

    function requestDictResult (id: DictID): Promise<MsgFetchDictResultResponse<any>> {
      return message.send<MsgFetchDictResult>({
        type: MsgType.FetchDictResult,
        id,
        text: info.text,
        payload: arg && arg.payload
          ? { isPDF: isSaladictPDFPage, ...arg.payload }
          : { isPDF: isSaladictPDFPage },
      })
    }

    function doSearch (id: DictID): Promise<MsgFetchDictResultResponse<any>> {
      return requestDictResult(id)
        .then(response => {
          dispatch(searchEnd({ id, info, result: response.result }))
          return response
        })
        .catch(() => {
          dispatch(searchEnd({ id, info , result: null }))
          return { id, result: null }
        })
    }
  }
}

export function summonedPanelInit (
  preload: PreloadSource,
  autoSearch: boolean,
  // quick-search could be turned off so this argument is needed
  standalone: '' | 'popup' | 'quick-search',
): DispatcherThunk {
  return async (dispatch, getState) => {
    if (!preload) { return }

    const state = getState()

    let info: SelectionInfo | null = null

    try {
      if (preload === 'selection') {
        if (standalone === 'popup') {
          const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
          if (tab && tab.id != null) {
            info = await message.send(tab.id, { type: MsgType.PreloadSelection })
          }
        } else if (standalone === 'quick-search') {
          const infoText = new URL(document.URL).searchParams.get('info')
          if (infoText) {
            try {
              info = JSON.parse(decodeURIComponent(infoText))
            } catch (err) {
              info = null
            }
          }
        } else {
          info = { ...state.selection.selectionInfo }
        }
      } else /* preload === clipboard */ {
        const text = await message.send({ type: MsgType.GetClipboard })
        info = getDefaultSelectionInfo({ text, title: 'From Clipboard' })
      }
    } catch (e) {
      if (process.env.DEV_BUILD) {
        console.warn(e)
      }
    }

    if (info) {
      if (autoSearch && info.text) {
        dispatch(searchText({ info }))
      } else {
        dispatch(restoreDicts())
        dispatch(searchBoxUpdate({ text: info.text, index: 0 }))
      }
    }
  }
}
