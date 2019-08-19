import { createReducer } from '../utils/createReducer'
import { Init } from '../utils/types'
import { DictID } from '@/app-config'
import { Word } from '@/_helpers/record-manager'
import getDefaultProfile from '@/app-config/profiles'
import { checkSupportedLangs, countWords } from '@/_helpers/lang-check'

export type ActionCatalog = {
  /** Click or hover on salad bowl */
  'WIDGET/BOWL_ACTIVATED': {}
  'WIDGET/SEARCH_END': {
    payload: {
      id: DictID
      result: any
    }
  }
  'WIDGET/SEARCH_START': {
    payload?: {
      /** Search with specific dict */
      id?: DictID
      /** Search specific word */
      word?: Word
      /** Additional payload passed to search engine */
      payload?: any
    }
  }
  /** Is current word in Notebook */
  'WIDGET/WORD_IN_NOTEBOOK': {
    payload: boolean
  }
}

export type State = typeof initState

const initState = {
  isShowBowl: false,
  isShowDictPanel: false,
  /** is a standalone quick search panel running */
  withQSPanel: false,
  /** Is current word in Notebook */
  isFav: false,
  dictsConfig: getDefaultProfile().dicts,
  /** Dicts that will be rendered to dict panel */
  renderedDicts: [] as {
    readonly id: DictID
    readonly searchStatus: 'IDLE' | 'SEARCHING' | 'FINISH'
    readonly searchResult: any
  }[],
  /** 0 is the oldest */
  searchHistory: [] as Word[],
  /** User can view back search history */
  historyIndex: 0
}

export const reducer = createReducer<ActionCatalog, State>(initState, {
  'CONFIG/NEW_PROFILE': (state, { payload }) => ({
    ...state,
    dictsConfig: payload.dicts,
    renderedDicts: state.renderedDicts.filter(({ id }) =>
      payload.dicts.selected.includes(id)
    )
  }),
  'WIDGET/BOWL_ACTIVATED': state => ({
    ...state,
    isShowBowl: false,
    isShowDictPanel: true
  }),
  'WIDGET/SEARCH_END': (state, { payload }) => {
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
  'WIDGET/SEARCH_START': (state, { payload }) => {
    if ((!payload || !payload.word) && state.searchHistory.length <= 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`WIDGET/SEARCH_START: Empty word on first search`, payload)
      }
      return state
    }

    // is the new word equal to the last word in history
    const shouldAddHistory =
      payload &&
      payload.word &&
      (payload.word.text !== state.searchHistory[0].text ||
        payload.word.context !== state.searchHistory[0].context)

    const word = (payload && payload.word) || state.searchHistory[0]

    return {
      ...state,
      renderedDicts:
        payload && payload.id
          ? // expand an folded dict item
            state.renderedDicts.map(d =>
              d.id === payload.id
                ? {
                    id: d.id,
                    searchStatus: 'SEARCHING',
                    searchResult: null
                  }
                : d
            )
          : state.dictsConfig.selected
              .filter(id => {
                // dicts that should be rendered
                const dict = state.dictsConfig.all[id]
                if (checkSupportedLangs(dict.selectionLang, word.text)) {
                  const wordCount = countWords(word.text)
                  const { min, max } = dict.selectionWC
                  return wordCount >= min && wordCount <= max
                }
                return false
              })
              .map(id => {
                // fold or unfold
                return {
                  id,
                  searchStatus: checkSupportedLangs(
                    state.dictsConfig.all[id].defaultUnfold,
                    word.text
                  )
                    ? 'SEARCHING'
                    : 'IDLE',
                  searchResult: null
                }
              }),
      searchHistory: shouldAddHistory
        ? [...state.searchHistory, payload!.word!]
        : state.searchHistory,
      historyIndex: shouldAddHistory
        ? state.searchHistory.length
        : state.historyIndex
    }
  },
  'WIDGET/WORD_IN_NOTEBOOK': (state, { payload }) => ({
    ...state,
    isFav: payload
  })
})

export default reducer

export const init: Init<ActionCatalog> = dispatch => {}
