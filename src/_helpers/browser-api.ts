/**
 * @file Wraps some of the extension apis
 */

/* --------------------------------------- *\
 * #Types
\* --------------------------------------- */

/** For self page messaging */
declare global {
  interface Window {
    pageId: number | string
    faviconURL: string
    pageTitle: string
    pageURL: string
  }
}

type StorageArea = 'all' | 'local' | 'sync'

type StorageListenerCb = (
  changes: browser.storage.ChangeDict,
  areaName: browser.storage.StorageName,
) => void

interface Message {
  type: string
  [propName: string]: any
}

/* --------------------------------------- *\
 * #Globals
\* --------------------------------------- */

function noop () { /* do nothing */ }

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const messageListeners: Map<browser.runtime.onMessageEvent, Map<string, browser.runtime.onMessageEvent>> = new Map()

/**
 * For self page messaging
 * key: {function} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const messageSelfListeners: Map<browser.runtime.onMessageEvent, Map<string, browser.runtime.onMessageEvent>> = new Map()

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: msg, values: generated or user's callback functions
 */
const storageListeners: Map<StorageListenerCb, Map<string, StorageListenerCb>> = new Map()

/* --------------------------------------- *\
 * #Exports
\* --------------------------------------- */

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
    removeListener: _storageRemoveListener('local') as typeof browser.storage.onChanged.removeListener,
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
  send: messageSend,
  addListener: _messageAddListener(false),
  removeListener: _messageRemoveListener(false),

  self: {
    initClient,
    initServer,
    send: messageSendSelf,
    addListener: _messageAddListener(true),
    removeListener: _messageRemoveListener(true),
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

export const __META__ = process.env.NODE_ENV === 'test'
  ? {
    messageListeners,
    messageSelfListeners,
    storageListeners
  }
  : null

/* --------------------------------------- *\
 * #Storage
\* --------------------------------------- */

function _storageClear (storageArea: StorageArea) {
  return function storageClear (): Promise<void> {
    return storageArea === 'all'
      ? Promise.all([
        browser.storage.local.clear(),
        browser.storage.sync.clear(),
      ]).then(noop)
      : browser.storage[storageArea].clear()
  }
}

function _storageRemove (storageArea: 'sync' | 'local') {
  return function storageRemove (keys: string | string[]) {
    return browser.storage[storageArea].remove(keys)
  }
}

function _storageGet (storageArea: 'sync' | 'local') {
  return function storageGet (...args) {
    return browser.storage[storageArea].get(...args)
  }
}

function _storageSet (storageArea: 'sync' | 'local') {
  return function storageSet (keys: browser.storage.StorageObject) {
    return browser.storage[storageArea].set(keys)
  }
}

function _storageAddListener (storageArea: StorageArea) {
  return function storageAddListener (cb: StorageListenerCb): void {
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
    return browser.storage.onChanged.addListener(listener)
  }
}

function _storageRemoveListener (storageArea: StorageArea) {
  return function storageRemoveListener (cb: StorageListenerCb): void {
    const listeners = storageListeners.get(cb)
    if (listeners) {
      const listener = listeners.get(storageArea)
      if (listener) {
        browser.storage.onChanged.removeListener(listener)
        listeners.delete(storageArea)
        if (listeners.size <= 0) {
          storageListeners.delete(cb)
        }
        return
      }
    }
    browser.storage.onChanged.removeListener(cb)
  }
}

/* --------------------------------------- *\
 * #Message
\* --------------------------------------- */

function messageSend (tabId: number, message: Message): Promise<any>
function messageSend (message: Message): Promise<any>
function messageSend (...args): Promise<any> {
  if (args.length === 1) {
    return browser.runtime.sendMessage(args[0])
  } else {
    return browser.tabs.sendMessage(args[0], args[1])
  }
}

function messageSendSelf (message: Message): Promise<any> {
  return browser.runtime.sendMessage(Object.assign({}, message, {
    __pageId__: window.pageId,
    type: `_&_${message.type}_&_`
  }))
}

function _messageAddListener (self: boolean) {
  const allListeners = self ? messageSelfListeners : messageListeners
  return messageAddListener

  function messageAddListener (messageType: string, cb: browser.runtime.onMessageEvent): void
  function messageAddListener (cb: browser.runtime.onMessageEvent): void
  function messageAddListener (...args): void {
    const messageType = args.length === 1 ? undefined : args[0]
    const cb = args.length === 1 ? args[0] : args[1]
    let listeners = allListeners.get(cb)
    if (!listeners) {
      listeners = new Map()
      allListeners.set(cb, listeners)
    }
    let listener = listeners.get(messageType || '_&_MSG_DEFAULT_&_')
    if (!listener) {
      listener = (
        (message, sender, sendResponse) => {
          if (message && (self ? window.pageId === message.__pageId__ : !message.__pageId__)) {
            if (!messageType || message.type === messageType) {
              return cb(message, sender, sendResponse)
            }
          }
        }
      ) as browser.runtime.onMessageEvent
      listeners.set(messageType, listener)
    }
    return browser.runtime.onMessage.addListener(listener)
  }
}

function _messageRemoveListener (self: boolean) {
  const allListeners = self ? messageSelfListeners : messageListeners
  return messageRemoveListener

  function messageRemoveListener (messageType: string, cb: browser.runtime.onMessageEvent): void
  function messageRemoveListener (cb: browser.runtime.onMessageEvent): void
  function messageRemoveListener (...args): void {
    const messageType = args.length === 1 ? undefined : args[0]
    const cb = args.length === 1 ? args[0] : args[1]
    const listeners = allListeners.get(cb)
    if (listeners) {
      if (messageType) {
        const listener = listeners.get(messageType)
        if (listener) {
          browser.runtime.onMessage.removeListener(listener)
          listeners.delete(messageType)
          if (listeners.size <= 0) {
            allListeners.delete(cb)
          }
          return
        }
      } else {
        // delete all cb related callbacks
        listeners.forEach(listener => browser.runtime.onMessage.removeListener(listener))
        allListeners.delete(cb)
        return
      }
    }
    browser.runtime.onMessage.removeListener(cb)
  }
}

/**
 * Deploy client side
 * This method should be invoked in every page except background script,
 * before other self messaging api is used
 */
function initClient (): Promise<typeof window.pageId> {
  if (window.pageId === undefined) {
    return browser.runtime.sendMessage({ type: '__PAGE_INFO__' })
      .then(({ pageId, faviconURL, pageTitle, pageURL }) => {
        window.pageId = pageId
        window.faviconURL = faviconURL
        if (pageTitle) { window.pageTitle = pageTitle }
        if (pageURL) { window.pageURL = pageURL }
        return pageId
      })
  } else {
    return Promise.resolve(window.pageId)
  }
}

/**
 * Deploy server side
 * This method should be invoked in background script
 */
function initServer (): void {
  window.pageId = 'background page'
  const selfMsgTester = /^_&_(.+)_&_$/

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) { return }

    switch (message.type) {
      case '__PAGE_INFO__':
        sendResponse(_getPageInfo(sender))
        break
      default:
        break
    }

    const selfMsg = selfMsgTester.exec(message.type)
    if (selfMsg) {
      message.type = selfMsg[1]
      if (sender.tab) {
        return messageSend(sender.tab.id, message)
      } else {
        return messageSend(message)
      }
    }
  })
}

function _getPageInfo (sender) {
  const result = {
    pageId: '',
    faviconURL: '',
    pageTitle: '',
    pageURL: '',
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
      result.faviconURL = browser.runtime.getURL('assets/icon-16.png')
    }
  }
  return result
}
