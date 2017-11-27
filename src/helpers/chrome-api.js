/**
 * Wraps chrome extension apis
 */

import debug from 'debug'

var debugMsg = debug('message')

/**
 * key: {string} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const messageListeners = new Map()

const storageListeners = new Map()

export const storage = {
  sync: {
    clear: storageClear('sync'),
    remove: storageRemove('sync'),
    get: storageGet('sync'),
    set: storageSet('sync'),
    listen: storageListen('sync'),
    addListener: storageListen('sync'),
    on: storageListen('sync')
  },
  local: {
    clear: storageClear('local'),
    remove: storageRemove('local'),
    get: storageGet('local'),
    set: storageSet('local'),
    listen: storageListen('local'),
    addListener: storageListen('local'),
    on: storageListen('local')
  },
  listen: storageListen(),
  addListener: storageListen(),
  on: storageListen(),

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
  removeListener: messageStopListen,

  server: initServer,

  self: {
    send: messageSendSelf,
    fire: messageSendSelf,
    emit: messageSendSelf,

    listen: messageListenSelf,
    addListener: messageListenSelf,
    on: messageListenSelf,

    off: messageStopListen,
    removeListener: messageStopListen
  }
}

/**
 * create new tab or highlight existing tab
 * @param {string} url
 * @param {Function} [callback]
 * @return undefined if callback is passed, otherwise a Promise
 */
export function openURL (url, callback) {
  if (typeof url !== 'string') {
    throw new TypeError('arg 1 should be a string')
  }
  if (callback) {
    return _openURL(url, callback)
  } else {
    return new Promise(resolve => _openURL(url, resolve))
  }
}

export default {
  openURL,
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

function storageListen (storageArea) {
  /**
   * Listens to a specific key or uses the generic addListener
   * @param {string|number} [key] key to listen to
   * @param {function} cb callback function
   * @see https://developer.chrome.com/extensions/storage#event-onChanged
   */
  return function listen (key, cb) {
    if (typeof key === 'function') {
      cb = key
      key = ''
    }
    if (typeof key !== 'string') {
      throw new TypeError('Argument 1 should be string when argument 2 is a function.')
    }
    if (typeof cb !== 'function') {
      throw new TypeError('Callback should be a function.')
    }

    let listeners = storageListeners.get(cb)
    if (!listeners) {
      listeners = new Map()
      storageListeners.set(cb, listeners)
    }
    let callback = listeners.get(key)
    if (!callback) {
      callback = (changes, areaName) => {
        if (storageArea && areaName !== storageArea) {
          return
        }
        if (!key || changes[key]) {
          cb(changes, areaName)
        }
      }
      listeners.set(key, callback)
    }
    return chrome.storage.onChanged.addListener(callback)
  }
}

/**
 * remove listener
 * @param {function} listener listener function
 * @param {string} [key] key that listens to
 */
function storageStopListen (listener, key) {
  const listeners = storageListeners.get(listener)
  if (listeners) {
    if (typeof key === 'string') {
      const callback = listeners.get(key)
      if (callback) {
        listeners.delete(key)
        if (listeners.size <= 0) { storageListeners.delete(listener) }
        return chrome.storage.onChanged.removeListener(callback)
      }
    } else {
      Array.from(listeners.values()).forEach(callback => {
        chrome.storage.onChanged.removeListener(callback)
      })
      storageListeners.delete(listener)
    }
  } else {
    return chrome.storage.onChanged.removeListener(listener)
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
function messageSend (...args) {
  if (args[0] === Object(args[0])) {
    let [message, cb] = args
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

  let [tabId, message, cb] = args
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
 * @param {string} [msg] message to listen to
 * @param {function} cb callback function
 * @see https://developer.chrome.com/extensions/runtime#event-onMessage
 */
function messageListen (msg, cb) {
  if (typeof msg === 'function') {
    cb = msg
    msg = ''
  }
  if (typeof msg !== 'string') {
    throw new TypeError('Argument 1 should be string when argument 2 is a function.')
  }
  if (typeof cb !== 'function') {
    throw new TypeError('Callback should be a function.')
  }

  let listeners = messageListeners.get(cb)
  if (!listeners) {
    listeners = new Map()
    messageListeners.set(cb, listeners)
  }
  let callback = listeners.get(msg)
  if (!callback) {
    callback = msg
      ? (message, sender, sendResponse) => {
        if (message && message.msg === msg) {
          return cb(message, sender, sendResponse)
        }
      }
      : cb
    listeners.set(msg, callback)
  }
  return chrome.runtime.onMessage.addListener(callback)
}

/**
 * remove listener, whether it was added by this helper
 * @param {function} listener listener function
 * @param {string} [msg] msg that listens to
 */
function messageStopListen (listener, msg) {
  const listeners = messageListeners.get(listener)
  if (listeners) {
    if (typeof msg === 'string') {
      const callback = listeners.get(msg)
      if (callback) {
        listeners.delete(msg)
        if (listeners.size <= 0) { messageListeners.delete(listener) }
        return chrome.runtime.onMessage.removeListener(callback)
      }
    } else {
      Array.from(listeners.values()).forEach(callback => {
        chrome.runtime.onMessage.removeListener(callback)
      })
      messageListeners.delete(listener)
    }
  } else {
    return chrome.runtime.onMessage.removeListener(listener)
  }
}

/**
 * Self page communication
 * @param {object} message should be a JSON-ifiable object
 * @param {function} [cb] response callback
 * @returns {Promise|undefined} returns a promise with the response if callback is missed
 * @see https://developer.chrome.com/extensions/runtime#method-sendMessage
 * @see https://developer.chrome.com/extensions/tabs#method-sendMessage
 */
function messageSendSelf (message, cb) {
  if (message !== Object(message)) {
    throw new TypeError('arg 1 should be an object')
  }

  message.msg = `_&_${message.msg}_&_`
  if (typeof cb === 'function') {
    // callback mode
    if (typeof window.pageId === 'undefined') {
      return chrome.runtime.sendMessage({msg: '__PAGE_INFO__'}, ({pageId, faviconURL, pageTitle, pageURL}) => {
        window.pageId = pageId
        window.faviconURL = faviconURL
        if (pageTitle) { window.pageTitle = pageTitle }
        if (pageURL) { window.pageURL = pageURL }
        message.__pageId__ = pageId
        debugMsg('SELF send %s on %s (request page id)', message.msg, window.pageId)
        chrome.runtime.sendMessage(message, cb)
      })
    } else {
      message.__pageId__ = window.pageId
      debugMsg('SELF send %s on %s', message.msg, window.pageId)
      return chrome.runtime.sendMessage(message, cb)
    }
  } else {
    // Promise mode
    if (typeof window.pageId === 'undefined') {
      return messageSend({msg: '__PAGE_INFO__'})
        .then(({pageId, faviconURL, pageTitle, pageURL}) => {
          window.pageId = pageId
          window.faviconURL = faviconURL
          if (pageTitle) { window.pageTitle = pageTitle }
          if (pageURL) { window.pageURL = pageURL }
          message.__pageId__ = pageId
          debugMsg('SELF send %s on %s (request page id)', message.msg, window.pageId)
          return messageSend(message)
        })
    } else {
      message.__pageId__ = window.pageId
      debugMsg('SELF send %s on %s', message.msg, window.pageId)
      return messageSend(message)
    }
  }
}

/**
 * Self page communication
 * Listens to a specific message or uses the generic onMessage.addListener
 * @param {string|number} [msg] message to listen to
 * @param {function} cb callback function
 * @see https://developer.chrome.com/extensions/runtime#event-onMessage
 */
function messageListenSelf (msg, cb) {
  if (typeof window.pageId === 'undefined') {
    chrome.runtime.sendMessage({msg: '__PAGE_INFO__'}, ({pageId, faviconURL, pageTitle, pageURL}) => {
      window.pageId = pageId
      window.faviconURL = faviconURL
      if (pageTitle) { window.pageTitle = pageTitle }
      if (pageURL) { window.pageURL = pageURL }
    })
  }

  if (typeof msg === 'function') {
    cb = msg
    msg = ''
  }
  if (typeof msg !== 'string') {
    throw new TypeError('Argument 1 should be string when argument 2 is a function.')
  }
  if (typeof cb !== 'function') {
    throw new TypeError('Callback should be a function.')
  }

  let listeners = messageListeners.get(cb)
  if (!listeners) {
    listeners = new Map()
    messageListeners.set(cb, listeners)
  }
  let callback = listeners.get(msg)
  if (!callback) {
    callback = (message, sender, sendResponse) => {
      if (message && window.pageId === message.__pageId__) {
        if (!msg || message.msg === msg) {
          debugMsg('SELF Received %s on %s', msg, window.pageId)
          return cb(message, sender, sendResponse)
        }
      }
    }
    listeners.set(msg, callback)
  }
  debugMsg('SELF Listening to %s on %s', msg, window.pageId)
  return chrome.runtime.onMessage.addListener(callback)
}

const selfMsgTester = /^_&_(.+)_&_$/
/**
 * For self page messaging
 */
function initServer () {
  window.pageId = 'background page'
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) { return }

    const selfMsg = selfMsgTester.exec(message.msg)
    if (selfMsg) {
      debugMsg('SELF Received %s from %s', message.msg, getPageId(sender))
      message.msg = selfMsg[1]
      if (sender.tab) {
        messageSend(sender.tab.id, message, response => {
          sendResponse(response)
        })
      } else {
        messageSend(message, response => {
          sendResponse(response)
        })
      }

      return true
    }

    switch (message.msg) {
      case '__PAGE_INFO__':
        sendResponse(getPageInfo(sender))
        break
      default:
        break
    }
  })
}

function getPageInfo (sender) {
  const result = {
    faviconURL: ''
  }
  const tab = sender.tab
  if (tab) {
    result.pageId = tab.id
    if (tab.favIconUrl) { result.faviconURL = tab.favIconUrl }
    if (tab.url) { result.pageURL = tab.url }
    if (tab.title) { result.pageTitle = tab.title }
  } else {
    // FRAGILE: Assume only browser action page is tabless
    result.pageId = 'popup'
    if (sender.url && sender.url.startsWith('chrome')) {
      result.favIconUrl = chrome.runtime.getURL('assets/icon-16.png')
    }
  }
  return result
}

function _openURL (url, callback) {
  chrome.tabs.query({url}, tabs => {
    if (tabs.length > 0) {
      chrome.tabs.highlight({tabs: tabs[0].index}, callback)
    } else {
      chrome.tabs.create({url}, callback)
    }
  })
}
