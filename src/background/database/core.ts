import Dexie from 'dexie'
import { Word } from '@/_helpers/record-manager'

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

let db: SaladictDB | undefined

export async function getDB() {
  if (!db) {
    db = new SaladictDB()
  }

  if (!db.isOpen()) {
    await db.open()
  }

  return db
}
