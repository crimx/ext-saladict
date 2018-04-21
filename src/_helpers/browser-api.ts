/**
 * @file Wraps some of the extension apis
 */

import { Observable } from 'rxjs/Observable'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'
import { MsgType } from '@/typings/message'

/* --------------------------------------- *\
 * #Types
\* --------------------------------------- */

/** For self page messaging */
declare global {
  interface Window {
    pageId?: number | string
    faviconURL?: string
    pageTitle?: string
    pageURL?: string
  }
}

export type StorageArea = 'all' | 'local' | 'sync'

export type StorageListenerCb = (
  changes: browser.storage.ChangeDict,
  areaName: browser.storage.StorageName,
) => void

export interface Message {
  type: MsgType
  [propName: string]: any
}

type onMessageEvent = (
  message: Message,
  sender: browser.runtime.MessageSender,
  sendResponse: Function
) => Promise<any> | boolean | void

/* --------------------------------------- *\
 * #Globals
\* --------------------------------------- */

const noop = () => { /* do nothing */ }

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const messageListeners: Map<onMessageEvent, Map<Message['type'], onMessageEvent>> = new Map()

/**
 * For self page messaging
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const messageSelfListeners: Map<onMessageEvent, Map<Message['type'], onMessageEvent>> = new Map()

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const storageListeners: Map<StorageListenerCb, Map<string, StorageListenerCb>> = new Map()

/* --------------------------------------- *\
 * #Exports
\* --------------------------------------- */

export const storage = {
  sync: {
    clear: storageClear,
    remove: storageRemove,
    get: storageGet,
    set: storageSet,
    /** Only for sync area */
    addListener: storageAddListener,
    /** Only for sync area */
    removeListener: storageRemoveListener,
    createStream: storageCreateStream,
    get __storageArea__ (): 'sync' { return 'sync' },
  },
  local: {
    clear: storageClear,
    remove: storageRemove,
    get: storageGet,
    set: storageSet,
    /** Only for local area */
    addListener: storageAddListener,
    /** Only for local area */
    removeListener: storageRemoveListener,
    createStream: storageCreateStream,
    get __storageArea__ (): 'local' { return 'local' },
  },
  /** Clear all area */
  clear: storageClear,
  addListener: storageAddListener,
  removeListener: storageRemoveListener,
  createStream: storageCreateStream,
  get __storageArea__ (): 'all' { return 'all' },
}

/**
 * Wraps in-app runtime.sendMessage and tabs.sendMessage
 * Does not warp cross extension messaging!
 */
export const message = {
  send: messageSend,
  addListener: messageAddListener,
  removeListener: messageRemoveListener,
  createStream: messageCreateStream,
  get __self__ (): false { return false },

  self: {
    initClient,
    initServer,
    send: messageSendSelf,
    addListener: messageAddListener,
    removeListener: messageRemoveListener,
    createStream: messageCreateStream,
    get __self__ (): true { return true },
  }
}

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
export function openURL (url: string, self?: boolean): Promise<void> {
  if (self) { url = browser.runtime.getURL(url) }
  return browser.tabs.query({ url })
    // Only Chrome supports tab.highlight for now
    .then(tabs => (tabs.length > 0 && typeof browser.tabs.highlight === 'function')
      ? (browser.tabs.highlight({ tabs: tabs[0].index }) as Promise<any>)
      : (browser.tabs.create({ url }) as Promise<any>)
    )
    .then(noop)
}

export default {
  openURL,
  storage,
  message
}

/* --------------------------------------- *\
 * #Storage
\* --------------------------------------- */
type StorageThisTwo = typeof storage.sync | typeof storage.local
type StorageThisThree = StorageThisTwo | typeof storage

function storageClear (this: StorageThisThree): Promise<void> {
  return this.__storageArea__ === 'all'
    ? Promise.all([
      browser.storage.local.clear(),
      browser.storage.sync.clear(),
    ]).then(noop)
    : browser.storage[this.__storageArea__].clear()
}

function storageRemove (this: StorageThisTwo, keys: string | string[]): Promise<void> {
  return browser.storage[this.__storageArea__].remove(keys)
}

function storageGet<T = any> (key?: string | string[] | null): Promise<T>
function storageGet<T extends Object> (key: T | any): Promise<T>
function storageGet<T = any> (this: StorageThisTwo, ...args): Promise<T> {
  return browser.storage[this.__storageArea__].get(...args)
}

function storageSet (this: StorageThisTwo, keys: any): Promise<void> {
  return browser.storage[this.__storageArea__].set(keys)
}

function storageAddListener (cb: StorageListenerCb): void
function storageAddListener (key: string, cb: StorageListenerCb): void
function storageAddListener (this: StorageThisThree, ...args): void {
  let key: string
  let cb: StorageListenerCb
  if (typeof args[0] === 'function') {
    key = ''
    cb = args[0]
  } else if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    key = args[0]
    cb = args[1]
  } else {
    throw new Error('wrong arguments type')
  }

  let listeners = storageListeners.get(cb)
  if (!listeners) {
    listeners = new Map()
    storageListeners.set(cb, listeners)
  }
  const listenerKey = this.__storageArea__ + key
  let listener = listeners.get(listenerKey)
  if (!listener) {
    listener = (changes, areaName) => {
      if ((this.__storageArea__ === 'all' || areaName === this.__storageArea__) && (!key || changes[key])) {
        cb(changes, areaName)
      }
    }
    listeners.set(listenerKey, listener)
  }
  return browser.storage.onChanged.addListener(listener)
}

function storageRemoveListener (key: string, cb: StorageListenerCb): void
function storageRemoveListener (cb: StorageListenerCb): void
function storageRemoveListener (this: StorageThisThree, ...args): void {
  let key: string
  let cb: StorageListenerCb
  if (typeof args[0] === 'function') {
    key = ''
    cb = args[0]
  } else if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    key = args[0]
    cb = args[1]
  } else {
    throw new Error('wrong arguments type')
  }

  const listeners = storageListeners.get(cb)
  if (listeners) {
    if (key) {
      // remove 'cb' listeners with 'key' under 'storageArea'
      const listenerKey = this.__storageArea__ + key
      const listener = listeners.get(listenerKey)
      if (listener) {
        browser.storage.onChanged.removeListener(listener)
        listeners.delete(listenerKey)
        if (listeners.size <= 0) {
          storageListeners.delete(cb)
        }
        return
      }
    } else {
      // remove all 'cb' listeners under 'storageArea'
      listeners.forEach(listener => {
        browser.storage.onChanged.removeListener(listener)
      })
      storageListeners.delete(cb)
      return
    }
  }
  browser.storage.onChanged.removeListener(cb)
}

function storageCreateStream<T> (selector?: (...args) => T): Observable<T>
function storageCreateStream<T> (key: string, selector?: (...args) => T): Observable<T>
function storageCreateStream (this: StorageThisThree, ...args) {
  let key = ''
  let selector = x => x

  if (typeof args[0] === 'function') {
    selector = args[0]
  } else {
    key = args[0]
    selector = args[1]
  }

  if (key) {
    return fromEventPattern(
      handler => this.addListener(key, handler as StorageListenerCb),
      handler => this.removeListener(key, handler as StorageListenerCb),
      selector,
    )
  } else {
    return fromEventPattern(
      handler => this.addListener(handler as StorageListenerCb),
      handler => this.removeListener(handler as StorageListenerCb),
      selector,
    )
  }
}

/* --------------------------------------- *\
 * #Message
\* --------------------------------------- */
type MessageThis = typeof message | typeof message.self

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
  if (window.pageId === undefined) {
    return initClient().then(() => messageSendSelf(message))
  }
  return browser.runtime.sendMessage(Object.assign({}, message, {
    __pageId__: window.pageId,
    type: `[[${message.type}]]`
  }))
}

function messageAddListener (messageType: Message['type'], cb: onMessageEvent): void
function messageAddListener (cb: onMessageEvent): void
function messageAddListener (this: MessageThis, ...args): void {
  const allListeners = this.__self__ ? messageSelfListeners : messageListeners
  const messageType = args.length === 1 ? undefined : args[0]
  const cb = args.length === 1 ? args[0] : args[1]
  let listeners = allListeners.get(cb)
  if (!listeners) {
    listeners = new Map()
    allListeners.set(cb, listeners)
  }
  let listener = listeners.get(messageType || MsgType.Default)
  if (!listener) {
    listener = (
      (message, sender, sendResponse) => {
        if (message && (this.__self__ ? window.pageId === message.__pageId__ : !message.__pageId__)) {
          if (!messageType || message.type === messageType) {
            return cb(message, sender, sendResponse)
          }
        }
      }
    ) as onMessageEvent
    listeners.set(messageType, listener)
  }
  return browser.runtime.onMessage.addListener(listener)
}

function messageRemoveListener (messageType: Message['type'], cb: onMessageEvent): void
function messageRemoveListener (cb: onMessageEvent): void
function messageRemoveListener (this: MessageThis, ...args): void {
  const allListeners = this.__self__ ? messageSelfListeners : messageListeners
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

function messageCreateStream<T> (selector?: (...args) => T): Observable<T>
function messageCreateStream<T> (messageType: Message['type'], selector?: (...args) => T): Observable<T>
function messageCreateStream (this: MessageThis, ...args) {
  let messageType: Message['type'] = MsgType.Null
  let selector = x => x

  if (typeof args[0] === 'function') {
    selector = args[0]
  } else {
    messageType = args[0]
    selector = args[1]
  }

  if (messageType !== MsgType.Null) {
    return fromEventPattern(
      handler => this.addListener(messageType, handler as onMessageEvent),
      handler => this.removeListener(messageType, handler as onMessageEvent),
      selector,
    )
  } else {
    return fromEventPattern(
      handler => this.addListener(handler as onMessageEvent),
      handler => this.removeListener(handler as onMessageEvent),
      selector,
    )
  }
}

/**
 * Deploy page script for self-messaging
 * This method is called on the first sendMessage
 */
function initClient (): Promise<typeof window.pageId> {
  if (window.pageId === undefined) {
    return browser.runtime.sendMessage({ type: MsgType.__PageInfo__ })
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
 * Deploy background proxy for self-messaging
 * This method should be invoked in background script
 */
function initServer (): void {
  window.pageId = 'background page'
  const selfMsgTester = /^\[\[(.+)\]\]$/

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) { return }

    switch (message.type) {
      case MsgType.__PageInfo__:
        sendResponse(_getPageInfo(sender))
        break
      default:
        break
    }

    const selfMsg = selfMsgTester.exec(message.type)
    if (selfMsg) {
      message.type = Number(selfMsg[1]) as MsgType
      if (sender.tab && sender.tab.id) {
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
