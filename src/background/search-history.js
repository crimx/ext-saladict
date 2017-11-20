import {storage} from 'src/helpers/chrome-api'

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

/**
 * @returns {Promise<HistoryItem[]>} A promise with the result to send back
 */
export function clear () {
  return storage.local.get('historyCatalog')
    .then(({historyCatalog}) => {
      if (historyCatalog) {
        return storage.local.remove(historyCatalog)
      }
    })
}

function appendItem ({historyCatalog, latestCol}, text) {
  // MMDDYYYY
  const today = getToday()
  const latestItem = latestCol.data[latestCol.data.length - 1]
  if (latestCol.data.length > 0 && today === latestItem.date) {
    latestItem.words.push(text)
  } else {
    latestCol.data.push({
      date: today,
      words: [text]
    })
  }
  latestCol.wordCount += 1

  let p1 = storage.local.set({[latestCol.id]: latestCol})

  let p2 = Promise.resolve()
  let p3 = Promise.resolve()
  // maintaining ~10000 words
  if (latestCol.wordCount >= 1000 && today !== latestItem.date) {
    historyCatalog.unshift(Date.now().toString())
    if (historyCatalog.length >= 10) {
      p2 = storage.local.remove(historyCatalog.pop())
    }
    p3 = storage.local.set({historyCatalog})
  }

  return Promise.all([p1, p2, p3]).then(() => {})
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
          cols[id].data.forEach(item => item.words.reverse())
          result = result.concat(cols[id].data.reverse())
        }
      })
      return result
    })
}

function getToday () {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const year = d.getFullYear()
  return (month < 10 ? '0' : '') + month + (date < 10 ? '0' : '') + date + year
}

export default {
  add,
  clear,
  getAll
}
