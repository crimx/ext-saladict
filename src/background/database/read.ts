import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { Message, MessageResponse } from '@/typings/message'
import { getDB } from './core'

export async function isInNotebook(word: Message<'IS_IN_NOTEBOOK'>['payload']) {
  const db = await getDB()
  return db.notebook
    .where('text')
    .equalsIgnoreCase(word.text)
    .count()
    .then(count => count > 0)
}

export async function getWordsByText({
  area,
  text
}: Message<'GET_WORDS_BY_TEXT'>['payload']) {
  const db = await getDB()
  return db[area]
    .where('text')
    .equalsIgnoreCase(text)
    .toArray()
}

export async function getWords({
  area,
  itemsPerPage,
  pageNum,
  filters = {},
  sortField = 'date',
  sortOrder = 'descend',
  searchText
}: Message<'GET_WORDS'>['payload']): Promise<MessageResponse<'GET_WORDS'>> {
  const db = await getDB()
  const collection = db[area].orderBy(
    sortField
      ? Array.isArray(sortField)
        ? sortField.map(str => String(str))
        : String(sortField)
      : 'date'
  )

  if (!sortOrder || sortOrder === 'descend') {
    collection.reverse()
  }

  const shouldFilter = Array.isArray(filters.text) && filters.text.length > 0
  if (shouldFilter || searchText) {
    const validLangs = shouldFilter
      ? (filters.text as string[]).reduce((o, l) => {
          o[l] = true
          return o
        }, {})
      : {}
    const ls = searchText ? searchText.toLocaleLowerCase() : ''
    collection.filter(record => {
      const rText = shouldFilter
        ? (validLangs['en'] && isContainEnglish(record.text)) ||
          (validLangs['ch'] && isContainChinese(record.text)) ||
          (validLangs['word'] && !/\s/.test(record.text)) ||
          (validLangs['phra'] && /\s/.test(record.text))
        : true

      const rSearch = searchText
        ? Object.values(record).some(
            v =>
              typeof v === 'string' && v.toLocaleLowerCase().indexOf(ls) !== -1
          )
        : true

      return rText && rSearch
    })
  }

  const total = await collection.count()

  if (typeof itemsPerPage !== 'undefined' && typeof pageNum !== 'undefined') {
    collection.offset(itemsPerPage * (pageNum - 1)).limit(itemsPerPage)
  }

  const words = await collection.toArray()

  return { total, words }
}
