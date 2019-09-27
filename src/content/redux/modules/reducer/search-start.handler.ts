import { StoreActionHandler } from '..'
import { checkSupportedLangs, countWords } from '@/_helpers/lang-check'
import { isPopupPage } from '@/_helpers/saladict'
import { Word } from '@/_helpers/record-manager'

export const searchStart: StoreActionHandler<'SEARCH_START'> = (
  state,
  { payload }
) => {
  const { activeProfile, searchHistory, historyIndex } = state

  let word: Word
  let newSearchHistory: Word[] = searchHistory.slice(0, historyIndex + 1)

  if (payload && payload.word) {
    word = payload.word
    const lastWord = searchHistory[historyIndex]
    console.log(word, lastWord)

    if (!lastWord || lastWord.text !== word.text) {
      newSearchHistory.push(word)
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
    isExpandMtaBox:
      activeProfile.mtaAutoUnfold === 'always' ||
      (activeProfile.mtaAutoUnfold === 'popup' && isPopupPage()),
    searchHistory: newSearchHistory,
    historyIndex: newSearchHistory.length - 1,
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
