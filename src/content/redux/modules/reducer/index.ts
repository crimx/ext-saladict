import { isOptionsPage, isStandalonePage } from '@/_helpers/saladict'
import { createReducer } from '../../utils/createReducer'
import { initState } from '../state'
import { ActionCatalog } from '../action-catalog'
import { searchStart } from './search-start.handler'
import { newSelection } from './new-selection.handler'
import { openQSPanel } from './open-qs-panel.handler'

export const reducer = createReducer<typeof initState, ActionCatalog>(
  initState,
  {
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

    NEW_PROFILE: (state, { payload }) => ({
      ...state,
      activeProfile: payload,
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
            shouldPanelShow: false,
            shouldBowlShow: false
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

    CLOSE_PANEL: state =>
      isOptionsPage() || isStandalonePage()
        ? state
        : {
            ...state,
            isPinned: false,
            isShowBowl: false,
            isShowDictPanel: false
          },

    WORD_IN_NOTEBOOK: (state, { payload }) => ({
      ...state,
      isFav: payload
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
            shouldPanelShow: false,
            shouldBowlShow: false
          }
        : {
            ...state,
            withQSPanel: payload
          }
    },

    OPEN_QS_PANEL: openQSPanel
  }
)

export default reducer
