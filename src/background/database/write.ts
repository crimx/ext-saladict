import { Word, DBArea } from '@/_helpers/record-manager'
import { Message } from '@/typings/message'
import { getDB } from './core'

export async function saveWord({
  area,
  word
}: Message<'SAVE_WORD'>['payload']) {
  const db = await getDB()
  return db[area].put(word)
}

export async function saveWords({
  area,
  words
}: {
  area: DBArea
  words: Word[]
}) {
  if (process.env.DEBUG) {
    if (words.length !== new Set(words.map(w => w.date)).size) {
      console.error('save Words: duplicate records')
    }
  }
  const db = await getDB()
  return db[area].bulkPut(words)
}

export async function deleteWords({
  area,
  dates
}: Message<'DELETE_WORDS'>['payload']) {
  const db = await getDB()
  return Array.isArray(dates) ? db[area].bulkDelete(dates) : db[area].clear()
}
