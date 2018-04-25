/**
 * @file Wraps some of the extension apis
 */

import { Observable, fromEventPattern } from 'rxjs'
import { map } from 'rxjs/operators'
import _ from 'lodash'
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
  type: number
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
    clear: _storageClear(),
    remove: _storageRemove(),
    get: _storageGet(),
    set: _storageSet(),
    /** Only for sync area */
    addListener: _storageAddListener('sync'),
    /** Only for sync area */
    removeListener: _storageRemoveListener('sync'),
    createStream: noop,
    dispatch: _dispatchStorageEvent('sync'),
  },
  local: {
    clear: _storageClear(),
    remove: _storageRemove(),
    get: _storageGet(),
    set: _storageSet(),
    /** Only for local area */
    addListener: _storageAddListener('local'),
    /** Only for local area */
    removeListener: _storageRemoveListener('local'),
    createStream: noop,
    dispatch: _dispatchStorageEvent('local'),
  },
  /** Clear all area */
  clear: _storageClear(),
  addListener: _storageAddListener('all'),
  removeListener: _storageRemoveListener('all'),
  createStream: noop,
  dispatch: dispatchStorageEvent,
}

storage.sync.createStream = _storageCreateStream('sync')
storage.local.createStream = _storageCreateStream('local')
storage.createStream = _storageCreateStream('all')

/**
 * Wraps in-app runtime.sendMessage and tabs.sendMessage
 * Does not warp cross extension messaging!
 */
export const message = {
  send: _messageSend(false),
  addListener: _messageAddListener(false),
  removeListener: _messageRemoveListener(false),
  createStream: noop,
  dispatch: _dispatchMessageEvent(false),

  self: {
    initClient: jest.fn(() => Promise.resolve()),
    initServer: jest.fn(noop),
    send: _messageSend(true),
    addListener: _messageAddListener(true),
    removeListener: _messageRemoveListener(true),
    createStream: noop,
    dispatch: _dispatchMessageEvent(true),
  },
}

message.createStream = _messageCreateStream(false)
message.self.createStream = _messageCreateStream(true)

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
export function openURL (url: string): Promise<void> {
  return Promise.resolve()
}

export default {
  openURL,
  storage,
  message
}

/* --------------------------------------- *\
 * #Storage
\* --------------------------------------- */
function _storageClear () {
  return jest.fn(storageClear)

  function storageClear (): Promise<void> {
    return Promise.resolve()
  }
}

function _storageRemove () {
  return jest.fn(storageRemove)

  function storageRemove (keys: string | string[]): Promise<void> {
    return Promise.resolve()
  }
}

function _storageGet () {
  return jest.fn(storageGet)

  function storageGet<T = any> (key?: string | string[] | null): Promise<T>
  function storageGet<T extends Object> (key: T | any): Promise<T>
  function storageGet<T = any> (...args): Promise<T> {
    return Promise.resolve() as any
  }
}

function _storageSet () {
  return jest.fn(storageSet)

  function storageSet (keys: any): Promise<void> {
    return Promise.resolve() as any
  }
}

function _storageAddListener (area: string) {
  return jest.fn(storageAddListener)

  function storageAddListener (cb: StorageListenerCb): void
  function storageAddListener (key: string, cb: StorageListenerCb): void
  function storageAddListener (...args): void {
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
    const listenerKey = area + key
    let listener = listeners.get(listenerKey)
    if (!listener) {
      listener = (changes, areaName) => {
        if ((area === 'all' || areaName === area) && (!key || changes[key])) {
          cb(changes, areaName)
        }
      }
      listeners.set(listenerKey, listener)
    }
  }
}

function _storageRemoveListener (area: string) {
  return jest.fn(storageRemoveListener)

  function storageRemoveListener (key: string, cb: StorageListenerCb): void
  function storageRemoveListener (cb: StorageListenerCb): void
  function storageRemoveListener (...args): void {
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
        const listenerKey = area + key
        const listener = listeners.get(listenerKey)
        if (listener) {
          listeners.delete(listenerKey)
          if (listeners.size <= 0) {
            storageListeners.delete(cb)
          }
          return
        }
      } else {
        // remove all 'cb' listeners under 'storageArea'
        storageListeners.delete(cb)
        return
      }
    }
  }
}

function _storageCreateStream (area: string) {
  return jest.fn(storageCreateStream)

  function storageCreateStream (key: string) {

    const obj = _.get(storage, area === 'all' ? '' : area)
    return fromEventPattern(
      handler => obj.addListener(key, handler as StorageListenerCb),
      handler => obj.removeListener(key, handler as StorageListenerCb),
    ).pipe(
      map(change => change[key])
    )
  }
}

interface DispatchStorageEventOptions {
  /** message key */
  key?: string
  newValue?: any
  oldValue?: any
}

interface DispatchStorageEventOptionsGeneral extends DispatchStorageEventOptions {
  area?: StorageArea | ''
}

function _dispatchStorageEvent (area: 'sync' | 'local') {
  const _fn = dispatchStorageEvent
  return function dispatchStorageEvent (options: DispatchStorageEventOptions) {
    return _fn(Object.assign(options, { area }))
  }
}

export function dispatchStorageEvent (options: DispatchStorageEventOptionsGeneral): void {
  storageListeners.forEach(m => {
    m.forEach((cb, key) => {
      if (!options.key || options.key === key) {
        if (!options.area || options.area === 'all') {
          cb({ newValue: options.newValue, oldValue: options.oldValue }, 'sync')
          cb({ newValue: options.newValue, oldValue: options.oldValue }, 'local')
        } else {
          cb({ newValue: options.newValue, oldValue: options.oldValue }, options.area)
        }
      }
    })
  })
}

/* --------------------------------------- *\
 * #Message
\* --------------------------------------- */
function _messageSend (self: boolean) {
  return jest.fn(self ? messageSendSelf : messageSend)

  function messageSend (tabId: number, message: Message): Promise<any>
  function messageSend (message: Message): Promise<any>
  function messageSend (...args): Promise<any> {
    return Promise.resolve()
  }

  function messageSendSelf (message: Message): Promise<any> {
    return Promise.resolve()
  }
}

function _messageAddListener (self: boolean) {
  return jest.fn(messageAddListener)

  function messageAddListener (messageType: Message['type'], cb: onMessageEvent): void
  function messageAddListener (cb: onMessageEvent): void
  function messageAddListener (...args): void {
    const allListeners = self ? messageSelfListeners : messageListeners
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
          if (message && (self ? window.pageId === message.__pageId__ : !message.__pageId__)) {
            if (!messageType || message.type === messageType) {
              return cb(message, sender, sendResponse)
            }
          }
        }
      ) as onMessageEvent
      listeners.set(messageType, listener)
    }
  }
}

function _messageRemoveListener (self: boolean) {
  return jest.fn(messageRemoveListener)

  function messageRemoveListener (messageType: Message['type'], cb: onMessageEvent): void
  function messageRemoveListener (cb: onMessageEvent): void
  function messageRemoveListener (...args): void {
    const allListeners = self ? messageSelfListeners : messageListeners
    const messageType = args.length === 1 ? undefined : args[0]
    const cb = args.length === 1 ? args[0] : args[1]
    const listeners = allListeners.get(cb)
    if (listeners) {
      if (messageType) {
        const listener = listeners.get(messageType)
        if (listener) {
          listeners.delete(messageType)
          if (listeners.size <= 0) {
            allListeners.delete(cb)
          }
          return
        }
      } else {
        // delete all cb related callbacks
        allListeners.delete(cb)
        return
      }
    }
  }
}

function _messageCreateStream (self: boolean) {
  return jest.fn(messageCreateStream)

  function messageCreateStream<T> (selector?: (...args) => T): Observable<T>
  function messageCreateStream<T> (messageType: Message['type'], selector?: (...args) => T): Observable<T>
  function messageCreateStream (...args) {
    let messageType: Message['type'] = MsgType.Null
    let selector = x => x

    if (typeof args[0] === 'function') {
      selector = args[0]
    } else {
      messageType = args[0]
      selector = args[1]
    }

    const obj = _.get(message, self ? 'self' : '')
    if (messageType !== MsgType.Null) {
      return fromEventPattern(
        handler => obj.addListener(messageType, handler as onMessageEvent),
        handler => obj.removeListener(messageType, handler as onMessageEvent),
        selector,
      )
    } else {
      return fromEventPattern(
        handler => obj.addListener(handler as onMessageEvent),
        handler => obj.removeListener(handler as onMessageEvent),
        selector,
      )
    }
  }
}

interface DispatchMessageEventOptions {
  message: Message
  sender?: browser.runtime.MessageSender
  sendResponse?: Function
}

interface DispatchMessageEventOptionsGeneral extends DispatchMessageEventOptions {
  self?: boolean
}

function _dispatchMessageEvent (self: boolean) {
  const _fn = dispatchMessageEvent
  return function dispatchMessageEvent (options: DispatchMessageEventOptions) {
    return _fn(Object.assign(options, { self }))
  }
}

export function dispatchMessageEvent (options: DispatchMessageEventOptionsGeneral) {
  const listeners = options.self ? messageSelfListeners : messageListeners
  listeners.forEach(m => {
    m.forEach((cb, type) => {
      if (options.message.type === type) {
        cb(options.message, options.sender || {}, options.sendResponse || noop)
      }
    })
  })
}
