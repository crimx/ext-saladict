import { ActionHandler } from 'retux'
import { checkSupportedLangs, countWords } from '@/_helpers/lang-check'
import { isPopupPage } from '@/_helpers/saladict'
import { Word } from '@/_helpers/record-manager'
import { State } from '../state'
import { ActionCatalog } from '../action-catalog'

export const searchStart: ActionHandler<
  State,
  ActionCatalog,
  'SEARCH_START'
> = (state, { payload }) => {
  const { activeProfile, searchHistory, historyIndex } = state

  let word: Word
  let newSearchHistory: Word[] =
    payload && payload.noHistory
      ? searchHistory
      : searchHistory.slice(0, historyIndex + 1)
  let newHistoryIndex = historyIndex

  if (payload && payload.word) {
    word = payload.word
    const lastWord = searchHistory[historyIndex]

    if (!payload.noHistory && (!lastWord || lastWord.text !== word.text)) {
      newSearchHistory.push(word)
      newHistoryIndex = newSearchHistory.length - 1
    }
  } else {
    word = searchHistory[historyIndex]
  }

  if (!word) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`SEARCH_START: Empty word on first search`, payload)
    }
    return state
  }

  return {
    ...state,
    text: word.text,
    isShowDictPanel: true,
    isExpandMtaBox:
      activeProfile.mtaAutoUnfold === 'always' ||
      (activeProfile.mtaAutoUnfold === 'popup' && isPopupPage()),
    searchHistory: newSearchHistory,
    historyIndex: newHistoryIndex,
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
        : activeProfile.dicts.selected
            .filter(id => {
              // dicts that should be rendered
              const dict = activeProfile.dicts.all[id]
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
                  activeProfile.dicts.all[id].defaultUnfold,
                  word.text
                )
                  ? 'SEARCHING'
                  : 'IDLE',
                searchResult: null
              }
            })
  }
}

export default searchStart
