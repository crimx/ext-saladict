import { getDB } from './core'

export async function getSyncMeta(serviceID: string) {
  const db = await getDB()
  return db.syncmeta
    .where('id')
    .equals(serviceID)
    .first(record => record && record.json)
    .catch(e => {
      if (process.env.DEBUG) {
        console.error(e)
      }
    })
}

export async function setSyncMeta(serviceID: string, text: string) {
  const db = await getDB()
  return db.syncmeta.put({ id: serviceID, json: text })
}

export async function deleteSyncMeta(serviceID: string) {
  const db = await getDB()
  return db.syncmeta.delete(serviceID).catch(e => {
    if (process.env.DEBUG) {
      console.error(e)
    }
  })
}
