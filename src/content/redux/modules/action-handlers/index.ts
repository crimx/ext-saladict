import { ActionHandlers } from 'retux'
import {
  isStandalonePage,
  isPopupPage,
  isQuickSearchPage,
  isOptionsPage
} from '@/_helpers/saladict'
import { State } from '../state'
import { ActionCatalog } from '../action-catalog'
import { searchStart } from './search-start'
import { newSelection } from './new-selection'
import { openQSPanel } from './open-qs-panel'

export const actionHandlers: ActionHandlers<State, ActionCatalog> = {
  NEW_CONFIG: (state, { payload }) => {
    const url = window.location.href
    const panelMaxHeight =
      (window.innerHeight * payload.panelMaxHeightRatio) / 100

    return {
      ...state,
      config: payload,
      panelHeight: Math.min(state.panelHeight, panelMaxHeight),
      panelMaxHeight,
      isQSFocus: payload.qsFocus,
      isTempDisabled:
        payload.blacklist.some(([r]) => new RegExp(r).test(url)) &&
        payload.whitelist.every(([r]) => !new RegExp(r).test(url))
    }
  },

  NEW_PROFILES: (state, { payload }) => ({
    ...state,
    profiles: payload
  }),

  NEW_ACTIVE_PROFILE: (state, { payload }) => {
    const isShowMtaBox = payload.mtaAutoUnfold !== 'hide'
    return {
      ...state,
      activeProfile: payload,
      isShowMtaBox,
      isExpandMtaBox:
        isShowMtaBox &&
        (payload.mtaAutoUnfold === 'once' ||
          payload.mtaAutoUnfold === 'always' ||
          (payload.mtaAutoUnfold === 'popup' && isPopupPage())),
      renderedDicts: state.renderedDicts.filter(({ id }) =>
        payload.dicts.selected.includes(id)
      )
    }
  },

  NEW_SELECTION: newSelection,

  WINDOW_RESIZE: state => ({
    ...state,
    panelMaxHeight:
      (window.innerHeight * state.config.panelMaxHeightRatio) / 100
  }),

  TEMP_DISABLED_STATE: (state, { payload }) =>
    payload
      ? {
          ...state,
          isTempDisabled: true,
          isPinned: false,
          // keep showing if it's standalone page
          isShowDictPanel: isStandalonePage(),
          isShowBowl: false,
          // also reset quick search panel state
          isQSPanel: isQuickSearchPage()
        }
      : {
          ...state,
          isTempDisabled: false
        },

  BOWL_ACTIVATED: state => ({
    ...state,
    isShowBowl: false,
    isShowDictPanel: true
  }),

  UPDATE_TEXT: (state, { payload }) => ({
    ...state,
    text: payload
  }),

  TOGGLE_MTA_BOX: state => ({
    ...state,
    isExpandMtaBox: !state.isExpandMtaBox
  }),

  TOGGLE_PIN: state => ({
    ...state,
    isPinned: !state.isPinned
  }),

  TOGGLE_QS_FOCUS: state => ({
    ...state,
    isQSFocus: !state.isQSFocus
  }),

  TOGGLE_WAVEFORM_BOX: state => ({
    ...state,
    isExpandWaveformBox: !state.isExpandWaveformBox
  }),

  OPEN_PANEL: (state, { payload }) =>
    isStandalonePage()
      ? state
      : {
          ...state,
          isShowDictPanel: true,
          dictPanelCoord: {
            x: payload.x,
            y: payload.y
          }
        },

  CLOSE_PANEL: state =>
    isStandalonePage()
      ? state
      : {
          ...state,
          isPinned: false,
          isShowBowl: false,
          isShowDictPanel: false,
          isQSPanel: isQuickSearchPage()
        },

  SWITCH_HISTORY: (state, { payload }) => {
    const historyIndex = Math.min(
      Math.max(0, state.historyIndex + (payload === 'prev' ? -1 : 1)),
      state.searchHistory.length - 1
    )

    return {
      ...state,
      historyIndex,
      text: state.searchHistory[historyIndex]
        ? state.searchHistory[historyIndex].text
        : state.text
    }
  },

  WORD_IN_NOTEBOOK: (state, { payload }) => ({
    ...state,
    isFav: payload
  }),

  ADD_TO_NOTEBOOK: state =>
    state.config.editOnFav && !isStandalonePage()
      ? state
      : {
          ...state,
          // epic will set this back to false if transation failed
          isFav: true
        },

  SEARCH_START: searchStart,

  SEARCH_END: (state, { payload }) => {
    if (state.renderedDicts.every(({ id }) => id !== payload.id)) {
      // this dict is for auto-pronunciation only
      return state
    }

    return {
      ...state,
      renderedDicts: state.renderedDicts.map(d =>
        d.id === payload.id
          ? {
              id: d.id,
              searchStatus: 'FINISH',
              searchResult: payload.result,
              catalog: payload.catalog
            }
          : d
      )
    }
  },

  UPDATE_PANEL_HEIGHT: (state, { payload }) => {
    const { _panelHeightCache } = state
    const sum =
      _panelHeightCache.sum - _panelHeightCache[payload.area] + payload.height
    const floatHeight =
      payload.floatHeight == null
        ? _panelHeightCache.floatHeight
        : payload.floatHeight

    return {
      ...state,
      panelHeight: Math.min(Math.max(sum, floatHeight), state.panelMaxHeight),
      _panelHeightCache: {
        ..._panelHeightCache,
        [payload.area]: payload.height,
        sum,
        floatHeight
      }
    }
  },

  USER_FOLD_DICT: (state, { payload }) => ({
    ...state,
    userFoldedDicts: {
      ...state.userFoldedDicts,
      [payload.id]: payload.fold
    }
  }),

  DRAG_START_COORD: (state, { payload }) => ({
    ...state,
    dragStartCoord: payload
  }),

  SUMMONED_PANEL_INIT: (state, { payload }) => ({
    ...state,
    text: payload,
    historyIndex: 0,
    isShowDictPanel: true,
    isShowBowl: false
  }),

  QS_PANEL_CHANGED: (state, { payload }) => {
    if (state.withQssaPanel === payload) {
      return state
    }

    // hide panel on otehr pages and leave just quick search panel
    return payload && state.config.qssaPageSel
      ? {
          ...state,
          withQssaPanel: payload,
          isPinned: false,
          // no hiding if it's browser action page
          isShowDictPanel:
            isPopupPage() || (isOptionsPage() ? state.isShowDictPanel : false),
          isShowBowl: false,
          isQSPanel: false
        }
      : {
          ...state,
          withQssaPanel: payload,
          isQSPanel: isQuickSearchPage()
        }
  },

  OPEN_QS_PANEL: openQSPanel,

  WORD_EDITOR_STATUS: (state, { payload: { word, translateCtx } }) =>
    word
      ? {
          ...state,
          wordEditor: {
            isShow: true,
            word,
            translateCtx: !!translateCtx
          },
          dictPanelCoord: {
            x: 50,
            y: window.innerHeight * 0.2
          }
        }
      : {
          ...state,
          wordEditor: {
            isShow: false,
            word: state.wordEditor.word,
            translateCtx: false
          }
        },

  PLAY_AUDIO: (state, { payload }) => ({
    ...state,
    lastPlayAudio: payload
  })
}
