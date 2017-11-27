/**
 * Abstracted layer for storing large amount of records.
 */

import {storage} from 'src/helpers/chrome-api'

const catVersion = 2

/**
 * @typedef {object} Word
 * @property {string} text
 */

/**
 * Gathered by date.
 * Latest -> Oldest
 * @typedef {object} Record
 * @property {string} date - time in MMDDYYYY format
 * @property {Word[]} data - word list
 */

/**
 * Latest -> Oldest
 * @typedef {object} RecordSet
 * @property {string} id - unique id
 * @property {Record[]} data - Record list
 * @property {number} wordCount - the amount of words of all item in the set ~500 max
 */

/**
 * Catalog of trvotf set
 * Latest -> Oldest
 * @typedef {object} RecordCat
 * @property {string[]} data - record set ids
 * @property {number} wordCount - the amount of all record items
 * @property {string} timestamp - let storage listener be notified
 */

/**
 * record a item
 * @param {string} area - namespace
 * @param {Word} word
 * @returns {Promise}
 */
export function addRecord (area, word) {
  const catName = area + 'Cat'
  return storage.local.get(catName)
    .then(res => getLatestSet(res[catName]))
    .then(getTodayItem)
    .then(res => appendAndSave(res, word, catName))
}

/**
 * @returns {Promise}
 */
export function clearRecords (area) {
  const catName = area + 'Cat'
  return storage.local.get(catName)
    .then(res => {
      const catalog = res[catName]
      if (catalog) {
        return storage.local.remove(catalog.data.concat(catName))
      }
      return Promise.resolve()
    })
}

/**
 * @returns {Promise}
 */
export function listenRecord (area, cb) {
  if (typeof cb === 'function') {
    storage.local.listen(area + 'Cat', cb)
  }
}

/**
 * @returns {Promise<Word[]>} A promise with the result to send back
 */
export function getAllWords (area) {
  const catName = area + 'Cat'
  return storage.local.get(catName)
    .then(res => {
      const catalog = res[catName]
      if (!catalog) { return Promise.resolve([]) }
      const setIds = catalog.data
      return storage.local.get(setIds)
        .then(allSets => {
          var result = []
          for (let i = 0; i < setIds.length; i++) {
            const records = allSets[setIds[i]].data
            for (let j = 0; j < records.length; j++) {
              result = result.concat(records[j].data)
            }
          }
          return result
        })
    })
}

/**
 * @returns {Promise}
 */
export function removeWord (area, setId, recordDate, text) {
  const catName = area + 'Cat'
  return storage.local.get(setId)
    .then(res => {
      const recordSet = res[setId]
      if (!recordSet) { return Promise.reject('no set to delete word') }

      const iRecord = recordSet.data.findIndex(r => r.date === recordDate)
      if (iRecord === -1) { return Promise.reject('no record to delete word') }
      const record = recordSet.data[iRecord]

      const iWord = record.data.findIndex(word => word.text === text)
      if (iWord === -1) { return Promise.reject('no word to delete') }

      record.data.splice(iWord, 1)
      recordSet.wordCount -= 1
      if (record.data.length <= 0) {
        // empty record
        recordSet.data.splice(iRecord, 1)
      }
      return storage.local.get(catName)
        .then(res => {
          const catalog = res[catName]
          catalog.wordCount -= 1
          catalog.timestamp = Date.now()
          if (recordSet.data.length <= 0) {
            // empty set
            const iSet = catalog.data.indexOf(setId)
            if (iSet !== -1) {
              catalog.data.splice(iSet, 1)
            }
            return storage.local.remove(setId)
              .then(() => {
                storage.local.set({[catName]: catalog})
              })
          }
          return storage.local.set({
            [catName]: catalog,
            [setId]: recordSet
          })
        })
    })
}

/**
 * @param {number} index
 * @return promsie with the record set, or undefined
 */
export function getRecordSet (area, index) {
  const catName = area + 'Cat'
  return storage.local.get(catName)
    .then(res => {
      const catalog = res[catName]
      if (catalog && catalog.data[index]) {
        const id = catalog.data[index]
        return storage.local.get(id)
          .then(res => ({
            recordSet: res[id],
            pageCount: catalog.data.length
          }))
      }
      return {}
    })
}

/**
 * @return promsie with a number
 */
export function getWordCount (area) {
  const catName = area + 'Cat'
  return storage.local.get(catName)
    .then(res => {
      const catalog = res[catName]
      return catalog ? catalog.wordCount : 0
    })
}

/**
 * returns Promise with ({catalog, latestSet})
 */
function getLatestSet (catalog) {
  if (!catalog || catalog.data.length <= 0) {
    const latestSet = {
      id: Date.now().toString(),
      data: [],
      wordCount: 0
    }
    catalog = {
      version: catVersion,
      data: [latestSet.id],
      wordCount: 0
    }
    return {catalog, latestSet}
  }

  const id = catalog.data[0]
  return storage.local.get(id)
    .then(response => {
      let latestSet = response[id]
      if (latestSet) {
        return {catalog, latestSet}
      } else {
        // data don't match up, something is wroing
        latestSet = {
          id: Date.now().toString(),
          data: [],
          wordCount: 0
        }
        // clean up & recalculate
        return storage.local.get(catalog.data)
          .then(allSets => {
            catalog.data = catalog.data.filter(id => allSets[id])
            catalog.wordCount = catalog.data.reduce((sum, id) => allSets[id].wordCount + sum, 0)
            catalog.data.unshift(latestSet.id)
            return {catalog, latestSet}
          })
      }
    })
}

/**
 * returns Promise with ({catalog, latestSet, todayItem})
 */
function getTodayItem ({catalog, latestSet}) {
  const today = getToday()
  if (latestSet.data.length > 0 && latestSet.data[0].date === today) {
    return {catalog, latestSet, todayItem: latestSet.data[0]}
  }

  // new date
  const todayItem = {
    date: today,
    data: []
  }

  if (latestSet.wordCount >= 500) {
    // open a new set
    latestSet = {
      id: Date.now().toString(),
      data: [],
      wordCount: 0
    }
    catalog.data.unshift(latestSet.id)
    if (catalog.data.length > 50) {
      // remove one set
      const oldestSet = catalog.data.pop()
      catalog.wordCount -= oldestSet.wordCount
      storage.local.remove(oldestSet.id)
    }
  }

  latestSet.data.unshift(todayItem)
  return {catalog, latestSet, todayItem}
}

function appendAndSave ({catalog, latestSet, todayItem}, word, catName) {
  const index = todayItem.data.findIndex(w => w.text === word.text)
  if (index === -1) {
    // new word
    latestSet.wordCount += 1
    catalog.wordCount += 1
  } else {
    // remove old one
    todayItem.data.splice(index, 1)
  }
  todayItem.data.unshift(word)
  catalog.timestamp = Date.now()

  return storage.local.set({
    [catName]: catalog,
    [latestSet.id]: latestSet
  })
}

function getToday () {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const year = d.getFullYear()
  return (month < 10 ? '0' : '') + month + (date < 10 ? '0' : '') + date + year
}

export default function init (area) {
  return {
    addRecord: (...args) => addRecord(area, ...args),
    clearRecords: (...args) => clearRecords(area, ...args),
    listenRecord: (...args) => listenRecord(area, ...args),
    getRecordSet: (...args) => getRecordSet(area, ...args),
    getAllWords: (...args) => getAllWords(area, ...args),
    removeWord: (...args) => removeWord(area, ...args),
    getWordCount: (...args) => getWordCount(area, ...args)
  }
}
