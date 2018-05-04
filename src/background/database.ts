import Dexie from 'dexie'
import { storage } from '@/_helpers/browser-api'
import { SelectionInfo } from '@/_helpers/selection'
import {
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWord,
  MsgGetWordsByText,
  MsgGetAllWords,
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

  constructor () {
    super('SaladictWords')

    this.version(1).stores({
      notebook: 'date,text,context,url',
      history: 'date,text,context,url',
    })
  }
}

export const db = new SaladictDB()

/*-----------------------------------------------*\
    Apis
\*-----------------------------------------------*/

export function isInNotebook ({ info }: MsgIsInNotebook) {
  return db.notebook
    .where('text')
    .equals(info.text)
    .count()
    .then(count => count > 0)
}

export function saveWord ({ area, info }: MsgSaveWord) {
  return db[area].put({
    ...info,
    date: info.date || Date.now()
  })
}

export function deleteWord ({ area, word }: MsgDeleteWord) {
  return db[area].delete(word.date)
}

export function getWordsByText ({ area, text }: MsgGetWordsByText) {
  return db[area]
    .where('text')
    .equals(text)
    .toArray()
}

export function getAllWords ({ area, itemsPerPage, pageNum }: MsgGetAllWords) {
  return db[area]
    .orderBy('date')
    .reverse()
    .offset(itemsPerPage * (pageNum - 1))
    .limit(itemsPerPage)
    .toArray()
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
          /** @todo use icon from github */
          favicon: oldWord.favicon
            ? oldWord.favicon.startsWith('chrome')
              ? 'https://raw.githubusercontent.com/crimx/ext-saladict/dev/public/static/icon-16.png'
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
