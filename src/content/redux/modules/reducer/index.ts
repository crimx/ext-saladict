import { createReducer } from '../../utils/createReducer'
import { initState } from '../state'
import { ActionCatalog } from '../action-catalog'
import { searchStart } from './search-start.handler'
import { newSelection } from './new-selection.handler'

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
    BOWL_ACTIVATED: state => ({
      ...state,
      isShowBowl: false,
      isShowDictPanel: true
    }),
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
    SEARCH_START: searchStart,
    WORD_IN_NOTEBOOK: (state, { payload }) => ({
      ...state,
      isFav: payload
    })
  }
)

export default reducer
