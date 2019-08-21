import {
  isStandalonePage,
  isPopupPage,
  isQuickSearchPage
} from '@/_helpers/saladict'
import { createReducer } from '../../utils/createReducer'
import { initState } from '../state'
import { ActionCatalog } from '../action-catalog'
import { searchStart } from './search-start.handler'
import { newSelection } from './new-selection.handler'
import { openQSPanel } from './open-qs-panel.handler'

export const reducer = createReducer<
  ReturnType<typeof initState>,
  ActionCatalog
>(initState(), {
  NEW_CONFIG: (state, { payload }) => {
    const url = window.location.href
    return {
      ...state,
      config: payload,
      isTempDisabled:
        payload.blacklist.some(([r]) => new RegExp(r).test(url)) &&
        payload.whitelist.every(([r]) => !new RegExp(r).test(url))
    }
  },

  NEW_PROFILES: (state, { payload }) => ({
    ...state,
    profiles: payload
  }),

  NEW_ACTIVE_PROFILE: (state, { payload }) => ({
    ...state,
    activeProfile: payload,
    isExpandMtaBox:
      payload.mtaAutoUnfold === 'once' ||
      payload.mtaAutoUnfold === 'always' ||
      (payload.mtaAutoUnfold === 'popup' && isPopupPage()),
    renderedDicts: state.renderedDicts.filter(({ id }) =>
      payload.dicts.selected.includes(id)
    )
  }),

  NEW_SELECTION: newSelection,

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

  UPDATE_HISTORY_INDEX: (state, { payload }) => ({
    ...state,
    historyIndex: payload
  }),

  WORD_IN_NOTEBOOK: (state, { payload }) => ({
    ...state,
    isFav: payload
  }),

  ADD_TO_NOTEBOOK: state => ({
    ...state,
    // epic will set this back to false if transation failed
    isFav: true
  }),

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
              searchResult: payload.result
            }
          : d
      )
    }
  },

  SUMMONED_PANEL_INIT: (state, { payload }) => ({
    ...state,
    text: payload,
    historyIndex: 0,
    isShowDictPanel: true,
    isShowBowl: false
  }),

  QS_PANEL_CHANGED: (state, { payload }) => {
    if (state.withQSPanel === payload) {
      return state
    }

    // hide panel on otehr pages and leave just quick search panel
    return payload
      ? {
          ...state,
          withQSPanel: payload,
          isPinned: false,
          // no hiding if it's browser action page
          isShowDictPanel: isPopupPage(),
          isShowBowl: false,
          isQSPanel: false
        }
      : {
          ...state,
          withQSPanel: payload,
          isQSPanel: isQuickSearchPage()
        }
  },

  OPEN_QS_PANEL: openQSPanel
})

export default reducer
