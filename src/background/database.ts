import Dexie from 'dexie'
import { storage } from '@/_helpers/browser-api'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'
import {
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWords,
  MsgGetWordsByText,
  MsgGetWords,
  MsgGetWordsResponse,
} from '@/typings/message'

export interface Word {
  /** primary key, milliseconds elapsed since the UNIX epoch */
  date: number
  /** word text */
  text: string
  /** the sentence where the text string is located */
  context: string
  /** page title */
  title: string
  /** page url */
  url: string
  /** favicon url */
  favicon: string
  /** translation */
  trans: string
  /** custom note */
  note: string
}

export type Area = 'notebook' | 'history'

export class SaladictDB extends Dexie {
  // @ts-ignore
  notebook: Dexie.Table<Word, number>
  // @ts-ignore
  history: Dexie.Table<Word, number>
  // @ts-ignore
  syncmeta: Dexie.Table<{ id: string, json: string }, string>

  constructor () {
    super('SaladictWords')

    this.version(1).stores({
      notebook: 'date,text,context,url',
      history: 'date,text,context,url',
      syncmeta: 'id'
    })
  }
}

export const db = new SaladictDB()

/*-----------------------------------------------*\
    Apis
\*-----------------------------------------------*/

export function getSyncMeta (serviceID: string) {
  return db.syncmeta
    .where('id')
    .equals(serviceID)
    .first(record => record && record.json)
}

export function setSyncMeta (serviceID: string, text: string) {
  return db.syncmeta
    .put({ id: serviceID, json: text })
}

export function isInNotebook ({ info }: MsgIsInNotebook) {
  return db.notebook
    .where('text')
    .equalsIgnoreCase(info.text)
    .count()
    .then(count => count > 0)
}

export function saveWord ({ area, info }: MsgSaveWord) {
  return db[area].put({
    ...info,
    date: info.date || Date.now()
  })
}

export function saveWords ({ area, words }: { area: Area, words: Word[] }) {
  if (process.env.DEV_BUILD) {
    if (words.length !== new Set(words.map(w => w.date)).size) {
      console.error('save Words: duplicate records')
    }
  }
  return db[area].bulkPut(words)
}

export function deleteWords ({ area, dates }: MsgDeleteWords) {
  return Array.isArray(dates)
    ? db[area].bulkDelete(dates)
    : db[area].clear()
}

export function getWordsByText ({ area, text }: MsgGetWordsByText) {
  return db[area]
    .where('text')
    .equalsIgnoreCase(text)
    .toArray()
}

export async function getWords ({
  area,
  itemsPerPage,
  pageNum,
  filters = {},
  sortField = 'date',
  sortOrder = 'descend',
  searchText,
}: MsgGetWords): Promise<MsgGetWordsResponse> {
  const collection = db[area].orderBy(sortField)

  if (sortOrder === 'descend') {
    collection.reverse()
  }

  const shouldFilter = Array.isArray(filters.text) && filters.text.length > 0
  if (shouldFilter || searchText) {
    const validLangs = shouldFilter
      ? (filters.text as string[]).reduce((o, l) => (o[l] = true, o) ,{})
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
        ? Object.values(record).some(v => (
          typeof v === 'string' &&
          v.toLocaleLowerCase().indexOf(ls) !== -1
        ))
        : true

      return rText && rSearch
    })
  }

  const total = await collection.count()

  if (typeof itemsPerPage !== 'undefined' && typeof pageNum !== 'undefined') {
    collection
      .offset(itemsPerPage * (pageNum - 1))
      .limit(itemsPerPage)
  }

  const words = await collection.toArray()

  return { total, words }
}

/*-----------------------------------------------*\
    Init
\*-----------------------------------------------*/

// Populate data from old non-indexed db version
db.on('ready', () => {
  return db.notebook.count(async count => {
    if (count > 0) { return }

    const { notebookCat } = await storage.local.get('notebookCat')
    if (!notebookCat || !Array.isArray(notebookCat.data)) { return }
    const sliceIDs = notebookCat.data

    const dbSlices = await storage.local.get(sliceIDs)
    const words: Word[] = []

    sliceIDs.forEach(sliceID => {
      const slice = dbSlices[sliceID]
      if (!slice || !Array.isArray(slice.data)) { return }
      slice.data.forEach(wordsGroupByDate => {
        const { date, data } = wordsGroupByDate
        const dateNum = new Date(`${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`)
          .getTime()
        const oldWords = data.map((oldWord, i) => ({
          date: dateNum + i,
          text: oldWord.text || '',
          context: oldWord.context || '',
          title: oldWord.title || '',
          favicon: oldWord.favicon
            ? oldWord.favicon.startsWith('chrome')
              ? 'https://raw.githubusercontent.com/crimx/ext-saladict/2ba9d2e85ad4ac2e4bb16ee43498ac4b58ed21a6/public/static/icon-16.png'
              : oldWord.favicon
            : '',
          url: oldWord.url || '',
          trans: oldWord.trans || '',
          note: oldWord.note || '',
        }))
        words.push(...oldWords)
      })
    })

    browser.storage.local.clear()

    return db.transaction('rw', db.notebook, () => {
      return db.notebook.bulkAdd(words)
    })
  })
})

db.open()
