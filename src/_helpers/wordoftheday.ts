import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { first } from '@/_helpers/promise-more'
import { handleNoResult, getText } from '@/components/dictionaries/helpers'

export async function getWordOfTheDay(): Promise<string> {
  if (!process.env.DEBUG) {
    try {
      return await first([
        getWebsterWordOfTheDay(),
        getDictionaryWordOfTheDay()
      ])
    } catch (e) {}
  }
  return 'salad'
}

export async function getWebsterWordOfTheDay(): Promise<string> {
  const doc = await fetchDirtyDOM(
    'https://www.merriam-webster.com/word-of-the-day'
  )
  const text = getText(doc, 'title')
  const matchResult = text.match(/Word of the Day: (.+) \| Merriam-Webster/)
  return (matchResult && matchResult[1]) || handleNoResult()
}

export async function getDictionaryWordOfTheDay(): Promise<string> {
  const doc = await fetchDirtyDOM('https://www.dictionary.com/wordoftheday/')
  const text = getText(doc, 'title')
  const matchResult = text.match(
    /Get the Word of the Day - (.+) \| Dictionary\.com/
  )
  return (matchResult && matchResult[1]) || handleNoResult()
}
