import {storage} from 'src/helpers/chrome-api'
import moment from 'moment'

/**
* @typedef {Object} HistoryItem
* @property {string} date - time in MMDDYYYY format
* @property {string[]} words - word list
*/

/**
* History Column format
* @typedef {Object} HistoryCol
* @property {string} id - random string
* @property {number} wordCount - word count of the column
* @property {HistoryItem[]} data
*/

/**
* @typedef {string[]} HistoryCatalog
*/

/**
 * record a search history
 * @param {string} text
 * @returns {Promise}
 */
export function add (text) {
  return storage.local.get('historyCatalog')
    .then(getlatestCol)
    .then(x => appendItem(x, text))
}

/**
 * @returns {Promise<HistoryItem[]>} A promise with the result to send back
 */
export function getAll () {
  return storage.local.get('historyCatalog')
    .then(mergeCols)
}

function getlatestCol ({historyCatalog}) {
  let latestColId
  if (!historyCatalog || historyCatalog.length <= 0) {
    // random id
    latestColId = Date.now().toString()
    historyCatalog = [latestColId]
    storage.local.set({historyCatalog})
  } else {
    latestColId = historyCatalog[0]
  }
  return storage.local.get(latestColId)
    .then(response => {
      let latestCol = response[latestColId]
      if (!latestCol) {
        latestCol = {
          id: latestColId,
          wordCount: 0,
          data: []
        }
      }
      return {historyCatalog, latestCol}
    })
}

function appendItem ({historyCatalog, latestCol}, text) {
  const today = moment().format('MMDDYYYY')
  const latestItem = latestCol.data[latestCol.data.length - 1]
  if (latestItem && today === latestItem.date) {
    latestItem.words.push(text)
  } else {
    latestCol.data.push({
      date: today,
      words: [text]
    })
  }
  latestCol.wordCount += 1

  storage.local.set({[latestCol.id]: latestCol})

  // maintaining 10000 words
  if (latestCol.wordCount > 1000) {
    historyCatalog.unshift(Date.now().toString())
    if (historyCatalog.length > 15) {
      storage.local.remove(historyCatalog.pop())
    }
    storage.local.set({historyCatalog})
  }
}

function mergeCols ({historyCatalog}) {
  if (!historyCatalog || historyCatalog.length <= 0) {
    return []
  }

  return storage.local.get(historyCatalog)
    .then(cols => {
      var result = []
      historyCatalog.forEach(id => {
        if (cols[id]) {
          result = result.concat(cols[id].data)
        }
      })
      return result
    })
}

export default {
  add,
  getAll
}
