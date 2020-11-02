/**
 * @file Wraps some of the extension apis
 */

import { Observable, fromEventPattern } from 'rxjs'
import { map } from 'rxjs/operators'
import { Message } from '@/typings/message'

/* --------------------------------------- *\
 * #Types
\* --------------------------------------- */

export type StorageArea = 'all' | 'local' | 'sync'

export type StorageListenerCb = (
  changes: browser.storage.StorageChange,
  areaName: string
) => void

type onMessageEvent = (
  message: Message,
  sender: browser.runtime.MessageSender,
  sendResponse: Function
) => Promise<any> | boolean | void

/* --------------------------------------- *\
 * #Globals
\* --------------------------------------- */

const noop = () => {
  /* do nothing */
}

// share the listener so that it can be manipulated manually
declare global {
  interface Window {
    __messageListeners__: Map<
      onMessageEvent,
      Map<Message['type'], onMessageEvent>
    >
    __messageSelfListeners__: Map<
      onMessageEvent,
      Map<Message['type'], onMessageEvent>
    >
    __storageListeners__: Map<StorageListenerCb, Map<string, StorageListenerCb>>
  }
}

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
window.__messageListeners__ = window.__messageListeners__ || new Map()

/**
 * For self page messaging
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
window.__messageSelfListeners__ = window.__messageSelfListeners__ || new Map()

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
window.__storageListeners__ = window.__storageListeners__ || new Map()

const messageListeners = window.__messageListeners__
const messageSelfListeners = window.__messageSelfListeners__
const storageListeners = window.__storageListeners__

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
    dispatch: _dispatchStorageEvent('sync')
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
    dispatch: _dispatchStorageEvent('local')
  },
  /** Clear all area */
  clear: _storageClear(),
  addListener: _storageAddListener('all'),
  removeListener: _storageRemoveListener('all'),
  createStream: noop as ReturnType<typeof _storageCreateStream>,
  dispatch: dispatchStorageEvent
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
    dispatch: _dispatchMessageEvent(true)
  }
}

message.createStream = _messageCreateStream(false)
message.self.createStream = _messageCreateStream(true)

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
export const openUrl = jest.fn(() => Promise.resolve())

export default {
  openUrl,
  storage,
  message
}

/* --------------------------------------- *\
 * #Storage
\* --------------------------------------- */
function _storageClear() {
  return jest.fn(storageClear)

  function storageClear(): Promise<void> {
    return Promise.resolve()
  }
}

function _storageRemove() {
  return jest.fn(storageRemove)

  function storageRemove(keys: string | string[]): Promise<void> {
    return Promise.resolve()
  }
}

function _storageGet() {
  return jest.fn(storageGet)

  function storageGet<T = any>(key?: string | string[] | null): Promise<T>
  function storageGet<T extends Object>(key: T | any): Promise<T>
  function storageGet<T = any>(...args): Promise<T> {
    return Promise.resolve() as any
  }
}

function _storageSet() {
  return jest.fn(storageSet)

  function storageSet(keys: any): Promise<void> {
    return Promise.resolve() as any
  }
}

function _storageAddListener(area: string) {
  return jest.fn(storageAddListener)

  function storageAddListener(cb: StorageListenerCb): void
  function storageAddListener(key: string, cb: StorageListenerCb): void
  function storageAddListener(...args): void {
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

function _storageRemoveListener(area: string) {
  return jest.fn(storageRemoveListener)

  function storageRemoveListener(key: string, cb: StorageListenerCb): void
  function storageRemoveListener(cb: StorageListenerCb): void
  function storageRemoveListener(...args): void {
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
        }
      } else {
        // remove all 'cb' listeners under 'storageArea'
        storageListeners.delete(cb)
      }
    }
  }
}

function _storageCreateStream(area: string) {
  return jest.fn(storageCreateStream)

  function storageCreateStream(key: string) {
    const obj = area === 'all' ? storage : storage[area]
    return fromEventPattern(
      handler => obj.addListener(key, handler as StorageListenerCb),
      handler => obj.removeListener(key, handler as StorageListenerCb)
    ).pipe(map((args: any) => (Array.isArray(args) ? args[0][key] : args[key])))
  }
}

interface DispatchStorageEventOptions {
  /** message key */
  key?: string
  newValue?: any
  oldValue?: any
}

interface DispatchStorageEventOptionsGeneral
  extends DispatchStorageEventOptions {
  area?: StorageArea | ''
}

function _dispatchStorageEvent(area: 'sync' | 'local') {
  const _fn = dispatchStorageEvent
  return function dispatchStorageEvent(options: DispatchStorageEventOptions) {
    return _fn(Object.assign(options, { area }))
  }
}

export function dispatchStorageEvent(
  options: DispatchStorageEventOptionsGeneral
): void {
  storageListeners.forEach(m => {
    m.forEach((cb, key) => {
      if (!options.key || options.key === key) {
        if (!options.area || options.area === 'all') {
          cb({ newValue: options.newValue, oldValue: options.oldValue }, 'sync')
          cb(
            { newValue: options.newValue, oldValue: options.oldValue },
            'local'
          )
        } else {
          cb(
            { newValue: options.newValue, oldValue: options.oldValue },
            options.area
          )
        }
      }
    })
  })
}

/* --------------------------------------- *\
 * #Message
\* --------------------------------------- */
function _messageSend(self: boolean) {
  return jest.fn(self ? messageSendSelf : messageSend)

  function messageSend(tabId: number, message: Message): Promise<any>
  function messageSend(message: Message): Promise<any>
  function messageSend(...args): Promise<any> {
    return Promise.resolve()
  }

  function messageSendSelf(message: Message): Promise<any> {
    return Promise.resolve()
  }
}

function _messageAddListener(self: boolean) {
  return jest.fn<void, [Message['type'], onMessageEvent] | [onMessageEvent]>(
    messageAddListener as any
  )

  function messageAddListener(
    messageType: Message['type'],
    cb: onMessageEvent
  ): void
  function messageAddListener(cb: onMessageEvent): void
  function messageAddListener(...args): void {
    const allListeners = self ? messageSelfListeners : messageListeners
    const messageType = args.length === 1 ? undefined : args[0]
    const cb = args.length === 1 ? args[0] : args[1]
    let listeners = allListeners.get(cb)
    if (!listeners) {
      listeners = new Map()
      allListeners.set(cb, listeners)
    }
    let listener = listeners.get(messageType || '__DEFAULT_MSGTYPE__')
    if (!listener) {
      listener = ((message, sender, sendResponse) => {
        if (message && (self ? window.pageId === 'PAGE_INFO' : !'PAGE_INFO')) {
          if (messageType == null || message.type === messageType) {
            return cb(message, sender, sendResponse)
          }
        }
      }) as onMessageEvent
      listeners.set(messageType, listener)
    }
  }
}

function _messageRemoveListener(self: boolean) {
  return jest.fn<void, [Message['type'], onMessageEvent] | [onMessageEvent]>(
    messageRemoveListener as any
  )

  function messageRemoveListener(
    messageType: Message['type'],
    cb: onMessageEvent
  ): void
  function messageRemoveListener(cb: onMessageEvent): void
  function messageRemoveListener(...args): void {
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
        }
      } else {
        // delete all cb related callbacks
        allListeners.delete(cb)
      }
    }
  }
}

function _messageCreateStream(self: boolean) {
  return jest.fn(messageCreateStream)

  function messageCreateStream<T>(
    messageType?: Message['type']
  ): Observable<T> {
    const obj = self ? message.self : message
    const pattern$ = messageType
      ? fromEventPattern(
          handler => obj.addListener(messageType, handler as onMessageEvent),
          handler => obj.removeListener(messageType, handler as onMessageEvent)
        )
      : fromEventPattern(
          handler => obj.addListener(handler as onMessageEvent),
          handler => obj.removeListener(handler as onMessageEvent)
        )

    return pattern$.pipe(map(args => (Array.isArray(args) ? args[0] : args)))
  }
}

interface DispatchMessageEventOptions {
  message: Message
  sender?: browser.runtime.MessageSender
  sendResponse?: Function
}

interface DispatchMessageEventOptionsGeneral
  extends DispatchMessageEventOptions {
  self?: boolean
}

function _dispatchMessageEvent(self: boolean) {
  const _fn = dispatchMessageEvent
  return function dispatchMessageEvent(options: DispatchMessageEventOptions) {
    return _fn(Object.assign(options, { self }))
  }
}

export function dispatchMessageEvent(
  options: DispatchMessageEventOptionsGeneral
) {
  const listeners = options.self ? messageSelfListeners : messageListeners
  listeners.forEach(m => {
    m.forEach((cb, type) => {
      if (options.message.type === type) {
        cb(options.message, options.sender || {}, options.sendResponse || noop)
      }
    })
  })
}
