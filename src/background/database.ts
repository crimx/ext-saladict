import Dexie from 'dexie'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import { Word, DBArea } from '@/_helpers/record-manager'
import { syncServiceUpload } from './sync-manager'
import { Message, MessageResponse } from '@/typings/message'

export class SaladictDB extends Dexie {
  // @ts-ignore
  notebook: Dexie.Table<Word, number>
  // @ts-ignore
  history: Dexie.Table<Word, number>
  // @ts-ignore
  syncmeta: Dexie.Table<{ id: string; json: string }, string>

  constructor() {
    super('SaladictWords')

    this.version(1).stores({
      notebook: 'date,text,context,url',
      history: 'date,text,context,url',
      syncmeta: 'id'
    })

    // The following lines are needed if your typescript
    // is compiled using babel instead of tsc:
    this.notebook = this.table('notebook')
    this.history = this.table('history')
    this.syncmeta = this.table('syncmeta')
  }
}

export const db = new SaladictDB()

/* ----------------------------------------------- *\
    Apis
\* ----------------------------------------------- */

export function getSyncMeta(serviceID: string) {
  return db.syncmeta
    .where('id')
    .equals(serviceID)
    .first(record => record && record.json)
    .catch(e => {
      if (process.env.DEV_BUILD) {
        console.error(e)
      }
    })
}

export function setSyncMeta(serviceID: string, text: string) {
  return db.syncmeta.put({ id: serviceID, json: text })
}

export function deleteSyncMeta(serviceID: string) {
  return db.syncmeta.delete(serviceID).catch(e => {
    if (process.env.DEV_BUILD) {
      console.error(e)
    }
  })
}

export function isInNotebook(word: Message<'IS_IN_NOTEBOOK'>['payload']) {
  return db.notebook
    .where('text')
    .equalsIgnoreCase(word.text)
    .count()
    .then(count => count > 0)
}

export function saveWord({
  area,
  word,
  fromSync
}: Message<'SAVE_WORD'>['payload']) {
  if (!fromSync && area === 'notebook') {
    syncServiceUpload({
      op: 'ADD',
      words: [word]
    }).catch(() => {})
  }
  return db[area].put(word)
}

export function saveWords({
  area,
  words,
  fromSync
}: {
  area: DBArea
  words: Word[]
  fromSync?: boolean // sync services
}) {
  if (process.env.DEV_BUILD) {
    if (words.length !== new Set(words.map(w => w.date)).size) {
      console.error('save Words: duplicate records')
    }
  }
  if (!fromSync && area === 'notebook') {
    syncServiceUpload({
      op: 'ADD',
      words
    }).catch(() => {
      /* nothing */
    })
  }
  return db[area].bulkPut(words)
}

export function deleteWords({
  area,
  dates
}: Message<'DELETE_WORDS'>['payload']) {
  if (area === 'notebook') {
    syncServiceUpload({
      op: 'DELETE',
      dates
    }).catch(() => {
      /* nothing */
    })
  }
  return Array.isArray(dates) ? db[area].bulkDelete(dates) : db[area].clear()
}

export function getWordsByText({
  area,
  text
}: Message<'GET_WORDS_BY_TEXT'>['payload']) {
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
  const collection = db[area].orderBy(sortField)

  if (sortOrder === 'descend') {
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

db.open()
