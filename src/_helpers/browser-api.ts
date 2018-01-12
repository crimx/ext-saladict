/**
 * @file Wraps some of the extension apis
 */

type StorageArea = 'all' | 'local' | 'sync'

type StorageListenerCb = (
  changes: browser.storage.ChangeDict,
  areaName: browser.storage.StorageName
) => void

function noop () { /* do nothing */ }

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const messageListeners: Map<Function, Map<string, Function>> = new Map()

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const storageListeners: Map<StorageListenerCb, Map<string, StorageListenerCb>> = new Map()

export const storage = {
  sync: {
    clear: _storageClear('sync') as typeof browser.storage.sync.clear,
    remove: _storageRemove('sync') as typeof browser.storage.sync.remove,
    get: _storageGet('sync') as typeof browser.storage.sync.get,
    set: _storageSet('sync') as typeof browser.storage.sync.set,
    /** Only for sync area */
    addListener: _storageAddListener('sync') as typeof browser.storage.onChanged.addListener,
    /** Only for sync area */
    removeListener: _storageRemoveListener('sync') as typeof browser.storage.onChanged.removeListener,
  },
  local: {
    clear: _storageClear('local') as typeof browser.storage.local.clear,
    remove: _storageRemove('local') as typeof browser.storage.local.remove,
    get: _storageGet('local') as typeof browser.storage.local.get,
    set: _storageSet('local') as typeof browser.storage.local.set,
    /** Only for local area */
    addListener: _storageAddListener('local') as typeof browser.storage.onChanged.addListener,
    /** Only for local area */
    removeListener: _storageRemoveListener('sync') as typeof browser.storage.onChanged.removeListener,
  },
  /** Clear all area */
  clear: _storageClear('all') as typeof browser.storage.sync.clear,
  addListener: _storageAddListener('all') as typeof browser.storage.onChanged.addListener,
  removeListener: _storageRemoveListener('all') as typeof browser.storage.onChanged.removeListener,
}

/**
 * Wraps in-app runtime.sendMessage and tabs.sendMessage
 * Does not warp cross extension messaging!
 */
export const message = {
  send: messageSend as typeof browser.runtime.sendMessage,
  addListener: messageListen as typeof browser.runtime.onMessage.addListener,
  removeListener: messageStopListen as typeof browser.runtime.onMessage.removeListener,
  server: initServer,

  self: {
    send: messageSendSelf,
    addListener: messageListenSelf,
    removeListener: messageStopListen
  }
}

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
export function openURL (url: string): Promise<browser.tabs.Tab[]> {
  return browser.tabs.query({ url })
    // Only Chrome supports tab.highlight for now
    .then(tabs => (tabs.length > 0 && typeof browser.tabs['highlight'] === 'function')
      ? browser.tabs['highlight']({ tabs: tabs[0].index })
      : browser.tabs.create({ url })
    )
}

export default {
  openURL,
  storage,
  message
}

function _storageClear (storageArea: StorageArea) {
  return function storageClear (...args): Promise<void> {
    return storageArea === 'all'
      ? Promise.all([
        browser.storage.local.clear(...args),
        browser.storage.sync.clear(...args),
      ]).then(noop)
      : browser.storage[storageArea].clear(...args)
  }
}

function _storageRemove (storageArea: 'sync' | 'local') {
  return function storageRemove (keys: string | string[], ...args) {
    return browser.storage[storageArea].remove(keys, ...args)
  }
}

function _storageGet (storageArea: 'sync' | 'local') {
  return function storageGet (...args) {
    return browser.storage[storageArea].get(...args)
  }
}

function _storageSet (storageArea: 'sync' | 'local') {
  return function storageSet (keys: browser.storage.StorageObject, ...args) {
    return browser.storage[storageArea].set(keys, ...args)
  }
}

function _storageAddListener (storageArea: StorageArea) {
  return function storageAddListener (cb: StorageListenerCb, ...args): void {
    let listeners = storageListeners.get(cb)
    if (!listeners) {
      listeners = new Map()
      storageListeners.set(cb, listeners)
    }
    let listener = listeners.get(storageArea)
    if (!listener) {
      listener = storageArea === 'all'
        ? cb
        : (changes, areaName) => {
          if (areaName === storageArea) {
            cb(changes, areaName)
          }
        }
      listeners.set(storageArea, listener)
    }
    return browser.storage.onChanged.addListener(listener, ...args)
  }
}

function _storageRemoveListener (storageArea: StorageArea) {
  return function storageRemoveListener (cb: StorageListenerCb, ...args): void {
    const listeners = storageListeners.get(cb)
    if (listeners) {
      const listener = listeners.get(storageArea)
      if (listener) {
        browser.storage.onChanged.removeListener(listener, ...args)
        listeners.delete(storageArea)
        if (listeners.size <= 0) {
          storageListeners.delete(cb)
        }
        return
      }
    }
    browser.storage.onChanged.removeListener(cb, ...args)
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
      debugMsg('SELF Received %s from %s', message.msg, getPageInfo(sender).pageId)
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
