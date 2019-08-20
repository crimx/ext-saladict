import { StoreActionHandler } from '..'
import { checkSupportedLangs, countWords } from '@/_helpers/lang-check'

export const searchStart: StoreActionHandler<'SEARCH_START'> = (
  state,
  { payload }
) => {
  const { activeProfile, searchHistory } = state
  if ((!payload || !payload.word) && searchHistory.length <= 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`SEARCH_START: Empty word on first search`, payload)
    }
    return state
  }

  // is the new word equal to the last word in history
  const shouldAddHistory =
    payload &&
    payload.word &&
    (payload.word.text !== searchHistory[0].text ||
      payload.word.context !== searchHistory[0].context)

  const word = (payload && payload.word) || searchHistory[0]

  return {
    ...state,
    searchHistory: shouldAddHistory
      ? [...searchHistory, payload!.word!]
      : searchHistory,
    historyIndex: shouldAddHistory ? searchHistory.length : state.historyIndex,
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
