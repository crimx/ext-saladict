/**
 * Wraps chrome extension apis
 */

export const storage = {
  sync: {
    clear: storageClear('sync'),
    remove: storageRemove('sync'),
    get: storageGet('sync'),
    set: storageSet('sync')
  },
  local: {
    clear: storageClear('local'),
    remove: storageRemove('local'),
    get: storageGet('local'),
    set: storageSet('local')
  },
  listen: storageListen,
  addListener: storageListen,
  on: storageListen,

  off: storageStopListen,
  removeListener: storageStopListen
}

/**
 * Wraps in-app runtime.sendMessage and tabs.sendMessage
 * Does not warp cross extension messaging!
 */
export const message = {
  send: messageSend,
  fire: messageSend,
  emit: messageSend,

  listen: messageListen,
  addListener: messageListen,
  on: messageListen,

  off: messageStopListen,
  removeListener: messageStopListen
}

export default {
  storage,
  message
}

function storageGet (storageArea) {
  /**
   * @param {string|array|Object|null} [keys] keys to get values
   * @param {function} [cb] callback with storage items or on failure
   * @returns {Promise|undefined} returns a promise with the result if callback is missed
   * @see https://developer.chrome.com/extensions/storage#method-StorageArea-get
   */
  return function get (keys, cb) {
    if (typeof keys === 'function') {
      cb = keys
      return chrome.storage[storageArea].get(cb)
    } else if (typeof cb === 'function') {
      return chrome.storage[storageArea].get(keys, cb)
    } else {
      return new Promise((resolve, reject) => {
        chrome.storage[storageArea].get(keys, data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else if (!data || Object.keys(data).length < 1) {
            reject({})
          } else {
            resolve(data)
          }
        })
      })
    }
  }
}

function storageSet (storageArea) {
  /**
   * @param {object} items items to set
   * @param {function} [cb] Callback on success, or on failure
   * @returns {Promise|undefined} returns a promise if callback is missed
   * @see https://developer.chrome.com/extensions/storage#method-StorageArea-set
   */
  return function set (items, cb) {
    if (typeof cb === 'function') {
      return chrome.storage[storageArea].set(items, cb)
    } else {
      return new Promise((resolve, reject) => {
        chrome.storage[storageArea].set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else {
            resolve()
          }
        })
      })
    }
  }
}

/**
 * Listens to a specific key or uses the generic addListener
 * @param {string|number} [key] key to listen to
 * @param {function} cb callback function
 * @see https://developer.chrome.com/extensions/storage#event-onChanged
 */
function storageListen (key, cb) {
  if (typeof key === 'function') {
    cb = key
    chrome.storage.onChanged.addListener(cb)
  } else if (typeof cb === 'function') {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[key]) {
        cb(changes, areaName)
      }
    })
  }
}

/**
 * remove listener
 * @param {function} listener listener function
 */
function storageStopListen (listener) {
  if (typeof listener === 'function') {
    chrome.storage.onChanged.removeListener(listener)
  }
}

function storageClear (storageArea) {
  /**
   * @param {function} [cb] Callback on success, or on failure
   * @returns {Promise|undefined} returns a promise if callback is missed
   * @see https://developer.chrome.com/extensions/storage#method-StorageArea-clear
   */
  return function clear (cb) {
    if (typeof cb === 'function') {
      return chrome.storage[storageArea].clear()
    } else {
      return new Promise((resolve, reject) => {
        chrome.storage[storageArea].clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else {
            resolve()
          }
        })
      })
    }
  }
}

function storageRemove (storageArea) {
  /**
   * @param {string|array|Object|null} keys keys to get values
   * @param {function} [cb] callback with storage items or on failure
   * @returns {Promise|undefined} returns a promise with the result if callback is missed
   * @see https://developer.chrome.com/extensions/storage#method-StorageArea-remove
   */
  return function remove (keys, cb) {
    if (typeof cb === 'function') {
      return chrome.storage[storageArea].remove(keys, cb)
    } else {
      return new Promise((resolve, reject) => {
        chrome.storage[storageArea].remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else {
            resolve()
          }
        })
      })
    }
  }
}

/**
 * @param {number|string} [tabId] send to a specific tab
 * @param {object} message should be a JSON-ifiable object
 * @param {function} [cb] response callback
 * @returns {Promise|undefined} returns a promise with the response if callback is missed
 * @see https://developer.chrome.com/extensions/runtime#method-sendMessage
 * @see https://developer.chrome.com/extensions/tabs#method-sendMessage
 */
function messageSend (tabId, message, cb) {
  if (tabId === Object(tabId)) {
    cb = message
    message = tabId
    if (typeof cb === 'function') {
      return chrome.runtime.sendMessage(message, cb)
    } else {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
          resolve(response)
        })
      })
    }
  }

  if (typeof cb === 'function') {
    return chrome.tabs.sendMessage(tabId, message, cb)
  } else {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, response => {
        resolve(response)
      })
    })
  }
}

/**
 * Listens to a specific message or uses the generic onMessage.addListener
 * @param {string|number} [msg] message to listen to
 * @param {function} cb callback function
 * @see https://developer.chrome.com/extensions/runtime#event-onMessage
 */
function messageListen (msg, cb) {
  if (typeof msg === 'function') {
    cb = msg
    chrome.runtime.onMessage.addListener(cb)
  } else if (typeof cb === 'function') {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.msg === msg) {
        return cb(message, sender, sendResponse)
      }
    })
  }
}

/**
 * remove listener
 * @param {function} listener listener function
 */
function messageStopListen (listener) {
  if (typeof listener === 'function') {
    chrome.runtime.onMessage.removeListener(listener)
  }
}
