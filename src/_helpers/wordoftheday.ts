import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { first } from '@/_helpers/promise-more'
import { handleNoResult, getText } from '@/components/dictionaries/helpers'

export function getWordOfTheDay (): Promise<string> {
  return first([
    getWebsterWordOfTheDay(),
    getDictionaryWordOfTheDay(),
  ]).catch(() => 'salad')
}

export function getWebsterWordOfTheDay (): Promise<string> {
  return fetchDirtyDOM('https://www.merriam-webster.com/word-of-the-day')
    .then<string>(doc => {
      const text = getText(doc, 'title')
      return (text.match(/Word of the Day: (.+) \| Merriam-Webster/) || ['', ''])[1] || handleNoResult()
    })
}

export function getDictionaryWordOfTheDay (): Promise<string> {
  return fetchDirtyDOM('https://www.dictionary.com/wordoftheday/')
    .then<string>(doc => {
      const text = getText(doc, 'title')
      return (text.match(/Get the Word of the Day - (.+) \| Dictionary\.com/) || ['', ''])[1] || handleNoResult()
    })
}
