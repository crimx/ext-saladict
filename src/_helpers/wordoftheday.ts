import { fetchDirtyDOM, fetchPlainText } from '@/_helpers/fetch-dom'
import { first } from '@/_helpers/promise-more'
import { handleNoResult, getText } from '@/components/dictionaries/helpers'

const WEBSTER_WORD_OF_THE_DAY_RSS =
  'https://www.merriam-webster.com/wotd/feed/rss2'
const WEBSTER_WORD_OF_THE_DAY_HTML =
  'https://www.merriam-webster.com/word-of-the-day'
const WORDSMITH_WORD_OF_THE_DAY_RSS = 'https://wordsmith.org/awad/rss1.xml'

export async function getWordOfTheDay(): Promise<string> {
  if (!process.env.DEBUG) {
    try {
      return await first([getWebsterWordOfTheDay(), getWordsmithWordOfTheDay()])
    } catch (e) {}
  }
  return 'salad'
}

export async function getWebsterWordOfTheDay(): Promise<string> {
  try {
    return await getRssWordOfTheDay(WEBSTER_WORD_OF_THE_DAY_RSS)
  } catch (e) {
    return getWebsterWordOfTheDayFromHTML()
  }
}

export async function getWebsterWordOfTheDayFromHTML(): Promise<string> {
  const doc = await fetchDirtyDOM(WEBSTER_WORD_OF_THE_DAY_HTML)
  const text = getText(doc, 'title')
  const matchResult = text.match(/Word of the Day: (.+) \| Merriam-Webster/)
  return (matchResult && matchResult[1]) || handleNoResult()
}

export async function getWordsmithWordOfTheDay(): Promise<string> {
  return getRssWordOfTheDay(WORDSMITH_WORD_OF_THE_DAY_RSS)
}

async function getRssWordOfTheDay(url: string): Promise<string> {
  const text = await fetchPlainText(url, {
    headers: {
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8'
    }
  })
  const word = _parseRssWordOfTheDay(text)
  return word || handleNoResult()
}

export function _parseRssWordOfTheDay(text: string): string {
  if (typeof DOMParser === 'undefined') {
    throw new Error('DOMParser is not available in this environment.')
  }

  const doc = new DOMParser().parseFromString(text, 'text/xml')
  return doc.querySelector('parsererror')
    ? ''
    : getText(doc, 'item > title', text => text.trim())
}
