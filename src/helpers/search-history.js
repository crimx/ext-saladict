/**
 * Abstracted layer for manipulating search history records.
 */

import {storage} from 'src/helpers/chrome-api'

/**
 * A search text.
* @typedef {string} Record
*/

/**
 * Records are gathered by date.
 * Latest -> Oldest
* @typedef {Object} Folder
* @property {string} date - time in MMDDYYYY format
* @property {Record[]} data - Record list
*/

/**
* Folders and stored into a collection when the
* total amount of Records in all ungathered Folders exceeds ~1000.
* Latest -> Oldest
* @typedef {Object} Collection
* @property {string} id - unique string
* @property {string[]} wordCount - the amount of Records in the collection
* @property {Folder[]} data - Folder list
*/

/**
 * Date(id)s of all the ungathered Folders.
 * Latest -> Oldest
* @typedef {Object} FolderCatalog
* @property {string[]} data - Folder dates
* @property {string[]} wordCount - the amount of all ungathered Records
*/

/**
 * Ids of all collections.
 * Latest -> Oldest
 * If there are more than 10 Collections, the oldest would be deleted.
* @typedef {string[]} CollectionCatalog
*/

/**
 * record a search history
 * @param {string} text
 * @returns {Promise}
 */
export function addSearchHistory (text) {
  return storage.local.get('folderCatalog')
    .then(({folderCatalog}) => appendRecord(folderCatalog, text))
}

/**
 * @returns {Promise}
 */
export function clearSearchHistory () {
  return storage.local.get(['folderCatalog', 'collectionCatalog'])
    .then(({folderCatalog, collectionCatalog}) => {
      return storage.local.remove(
        ['folderCatalog', 'collectionCatalog']
          .concat(
            folderCatalog ? folderCatalog.data : [],
            collectionCatalog || []
          )
      )
    })
}

/**
 * @returns {Promise}
 */
export function listenSearchHistory (cb) {
  if (typeof cb === 'function') {
    storage.local.listen('folderCatalog', cb)
  }
}

/**
 * @returns {Promise<Folder[]>} A promise with the result to send back
 */
export function getAllSearchHistory () {
  return storage.local.get(['folderCatalog', 'collectionCatalog'])
    .then(({folderCatalog, collectionCatalog}) => {
      return storage.local.get(
        [].concat(
          folderCatalog ? folderCatalog.data : [],
          collectionCatalog || []
        )
      )
        .then(response => mergeCollections({folderCatalog, collectionCatalog, response}))
    })
}

function appendRecord (folderCatalog, text) {
  const today = getToday()
  if (!folderCatalog || folderCatalog.data.length <= 0) {
    // First ungathered folder
    const todayFolder = {
      date: today,
      data: [text]
    }

    folderCatalog = {
      data: [today],
      wordCount: 1
    }

    return storage.local.set({
      folderCatalog,
      [today]: todayFolder
    })
      .then(() => ({folderCatalog, todayFolder}))
  }

  const latestFolderId = folderCatalog.data[0]

  if (today !== latestFolderId) {
    // new date
    const p = folderCatalog.wordCount >= 1000
      ? gatherFolders(folderCatalog)
      : Promise.resolve(folderCatalog)

    return p.then(folderCatalog => {
      const todayFolder = {
        date: today,
        data: [text]
      }
      folderCatalog.wordCount += 1
      folderCatalog.data.unshift(today)
      return storage.local.set({
        folderCatalog,
        [today]: todayFolder
      })
    })
  }

  // latestFolderId is today
  return storage.local.get(today)
    .then(response => {
      let todayFolder = response[today]
      console.assert(todayFolder, 'Today Folder should exist.')
      if (!todayFolder) {
        todayFolder = {
          date: today,
          data: []
        }
      }

      // ignore same words
      if (text !== todayFolder.data[0]) {
        todayFolder.data.unshift(text)
        folderCatalog.wordCount += 1

        return storage.local.set({
          folderCatalog,
          [today]: todayFolder
        })
      }
    })
}

/**
 * Gather Folders into a new Collection
 */
function gatherFolders (folderCatalog) {
  const folderIds = folderCatalog.data
  return storage.local.get(folderIds.concat(['collectionCatalog']))
    .then(response => {
      const collection = {
        id: Date.now().toString(),
        wordCount: 0,
        data: []
      }

      folderIds.forEach(id => {
        const folder = response[id]
        if (folder) {
          collection.wordCount += folder.data.wordCount
          collection.data.push(folder)
        }
      })

      const collectionCatalog = response.collectionCatalog || []
      collectionCatalog.unshift(collection.id)

      const removelist = folderCatalog.data
      if (collectionCatalog.length >= 10) {
        removelist.push(collectionCatalog.pop())
      }

      // Keep the pointer and change back
      folderCatalog.data = []
      folderCatalog.wordCount = 0

      return Promise.all([
        storage.local.remove(removelist),
        storage.local.set({
          folderCatalog,
          collectionCatalog,
          [collection.id]: collection
        })
      ]).then(() => folderCatalog)
    })
}

function mergeCollections ({folderCatalog, collectionCatalog, response}) {
  return [].concat(
    folderCatalog
      ? folderCatalog.data
        .map(id => response[id])
      : [],
    ...collectionCatalog
      ? collectionCatalog
        .map(id => response[id].data)
      : [[]]
  ).filter(Boolean)
}

function getToday () {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const year = d.getFullYear()
  return (month < 10 ? '0' : '') + month + (date < 10 ? '0' : '') + date + year
}

export default {
  add: addSearchHistory,
  clear: clearSearchHistory,
  listen: listenSearchHistory,
  getAll: getAllSearchHistory
}
