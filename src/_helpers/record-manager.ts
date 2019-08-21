/**
 * Abstracted layer for storing large amount of word records.
 */

import { message } from '@/_helpers/browser-api'

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

export type DBArea = 'notebook' | 'history'

export function newWord(word?: Partial<Word>): Word {
  return word
    ? {
        date: word.date || Date.now(),
        text: word.text || '',
        context: word.context || '',
        title: word.title || '',
        url: word.url || '',
        favicon: word.favicon || '',
        trans: word.trans || '',
        note: word.note || ''
      }
    : {
        date: Date.now(),
        text: '',
        context: '',
        title: '',
        url: '',
        favicon: '',
        trans: '',
        note: ''
      }
}

export function isInNotebook(word: Word): Promise<boolean> {
  return message
    .send<'IS_IN_NOTEBOOK'>({ type: 'IS_IN_NOTEBOOK', payload: word })
    .catch(logError(false))
}

export async function saveWord(area: DBArea, word: Word): Promise<void> {
  await message.send({ type: 'SAVE_WORD', payload: { area, word } })
}

export async function deleteWords(
  area: DBArea,
  dates?: number[]
): Promise<void> {
  await message.send({ type: 'SYNC_SERVICE_DOWNLOAD' })
  await message.send({ type: 'DELETE_WORDS', payload: { area, dates } })
}

export function getWordsByText(
  area: DBArea,
  text: string
): Promise<readonly Word[]> {
  return message.send<'GET_WORDS_BY_TEXT'>({
    type: 'GET_WORDS_BY_TEXT',
    payload: {
      area,
      text
    }
  })
}

export function getWords(
  area: DBArea,
  config: {
    itemsPerPage?: number
    pageNum?: number
    filters: { [field: string]: string[] | undefined }
    sortField?: string
    sortOrder?: 'ascend' | 'descend' | false
    searchText?: string
  }
) {
  return message.send<'GET_WORDS'>({
    type: 'GET_WORDS',
    payload: {
      area,
      ...config
    }
  })
}

function logError<T = any>(valPassThrough: T): (x: any) => T {
  return err => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err)
    }
    return valPassThrough
  }
}
