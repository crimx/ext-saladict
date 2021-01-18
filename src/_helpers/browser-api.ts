/**
 * @file Wraps some of the extension apis
 */

import { Observable, fromEventPattern } from 'rxjs'
import { map, filter } from 'rxjs/operators'

import { Message, MessageResponse, MsgType } from '@/typings/message'
import { Mutable } from '@/typings/helpers'

/* --------------------------------------- *\
 * #Types
\* --------------------------------------- */

export type StorageArea = 'all' | 'local' | 'sync'

export type StorageChange<T> = {
  oldValue?: T
  newValue?: T
}

export type StorageUpdate<T> = {
  oldValue?: T
  newValue: T
}

export type StorageListenerCb<T = any, K extends string = string> = (
  changes: {
    [field in K]: StorageChange<T>
  },
  areaName: string
) => void

type onMessageEvent<T extends Message = Message> = (
  message: T & { __pageId__?: string },
  sender: browser.runtime.MessageSender
) => Promise<any> | boolean | void

/* --------------------------------------- *\
 * #Globals
\* --------------------------------------- */

const noop = () => {
  /* do nothing */
}

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const messageListeners: WeakMap<
  Function,
  Map<MsgType | '__DEFAULT_MSGTYPE__', Function>
> = new WeakMap()

/**
 * For self page messaging
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const messageSelfListeners: WeakMap<
  Function,
  Map<MsgType | '__DEFAULT_MSGTYPE__', Function>
> = new WeakMap()

/**
 * key: {function} user's callback function
 * values: {Map} listeners, key: message type, values: generated or user's callback functions
 */
const storageListeners: WeakMap<
  StorageListenerCb,
  Map<string, StorageListenerCb>
> = new WeakMap()

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
    get __storageArea__(): 'sync' {
      return 'sync'
    }
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
    get __storageArea__(): 'local' {
      return 'local'
    }
  },
  /** Clear all area */
  clear: storageClear,
  addListener: storageAddListener,
  removeListener: storageRemoveListener,
  createStream: storageCreateStream,
  get __storageArea__(): 'all' {
    return 'all'
  }
} as const

/**
 * Wraps in-app runtime.sendMessage and tabs.sendMessage
 * Does not warp cross extension messaging!
 */
export const message = {
  send: messageSend,
  addListener: messageAddListener,
  removeListener: messageRemoveListener,
  createStream: messageCreateStream,
  get __self__(): false {
    return false
  },

  self: {
    initClient,
    initServer,
    send: messageSendSelf,
    addListener: messageAddListener,
    removeListener: messageRemoveListener,
    createStream: messageCreateStream,
    get __self__(): true {
      return true
    }
  }
} as const

export interface OpenUrlOptions {
  url: string
  /** use browser.runtime.getURL? */
  self?: boolean
  /** focus the new tab? default true */
  active?: boolean
  /** ignore existing url? default true */
  unique?: boolean
}

/**
 * Open a url on new tab or highlight a existing tab if already opened
 */
export async function openUrl(url: string, self?: boolean): Promise<void>
export async function openUrl(options: OpenUrlOptions): Promise<void>
export async function openUrl(
  optionsOrUrl: string | OpenUrlOptions,
  self?: boolean
): Promise<void> {
  const options: OpenUrlOptions =
    typeof optionsOrUrl === 'string'
      ? { url: optionsOrUrl, self }
      : optionsOrUrl
  const unique = options.unique !== false
  const url = options.self ? browser.runtime.getURL(options.url) : options.url

  if (unique) {
    const tabs = await browser.tabs.query({ url }).catch(() => [])
    if (tabs.length > 0) {
      const { index, windowId } = tabs[0]
      if (typeof browser.tabs['highlight'] === 'function') {
        // Only Chrome supports tab.highlight for now
        await browser.tabs['highlight']({ tabs: index, windowId })
      }
      await browser.windows.update(windowId!, { focused: true })
      return
    }
  }

  await browser.tabs.create({
    url,
    active: options.active !== false
  })
}

/* --------------------------------------- *\
 * #Storage
\* --------------------------------------- */
type StorageThisTwo = typeof storage.sync | typeof storage.local
type StorageThisThree = StorageThisTwo | typeof storage

function storageClear(): Promise<void>
function storageClear(this: StorageThisThree): Promise<void> {
  return this.__storageArea__ === 'all'
    ? Promise.all([
        browser.storage.local.clear(),
        browser.storage.sync.clear()
      ]).then(noop)
    : browser.storage[this.__storageArea__].clear()
}

function storageRemove(keys: string | string[]): Promise<void>
function storageRemove(
  this: StorageThisTwo,
  keys: string | string[]
): Promise<void> {
  return browser.storage[this.__storageArea__].remove(keys)
}

function storageGet<T = any>(
  key?: string | string[] | null
): Promise<Partial<T>>
function storageGet<T extends Object>(key: T | any): Promise<Partial<T>>
function storageGet<T = any>(this: StorageThisTwo, ...args) {
  return browser.storage[this.__storageArea__].get(...args) as Promise<
    Partial<T>
  >
}

function storageSet(keys: any): Promise<void>
function storageSet(this: StorageThisTwo, keys: any): Promise<void> {
  return browser.storage[this.__storageArea__].set(keys)
}

function storageAddListener<T = any>(cb: StorageListenerCb<T>): void
function storageAddListener<T = any, K extends string = string>(
  key: K,
  cb: StorageListenerCb<T, K>
): void
function storageAddListener(this: StorageThisThree, ...args): void {
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
      if (
        (this.__storageArea__ === 'all' || areaName === this.__storageArea__) &&
        (!key || key in changes)
      ) {
        cb(changes, areaName)
      }
    }
    listeners.set(listenerKey, listener)
  }
  return browser.storage.onChanged.addListener(listener)
}

function storageRemoveListener(key: string, cb: StorageListenerCb): void
function storageRemoveListener(cb: StorageListenerCb): void
function storageRemoveListener(this: StorageThisThree, ...args): void {
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

function storageCreateStream<T = any>(key: string): Observable<StorageChange<T>>
function storageCreateStream<T = any>(
  this: StorageThisThree,
  key: string
): Observable<StorageChange<T>> {
  if (!key) {
    throw new Error('Missing key')
  }
  return fromEventPattern<StorageChange<T>>(
    handler => this.addListener(key, handler as StorageListenerCb),
    handler => this.removeListener(key, handler as StorageListenerCb)
  ).pipe(
    filter(args =>
      Object.prototype.hasOwnProperty.call(
        Array.isArray(args) ? args[0] : args,
        key
      )
    ),
    map(args => (Array.isArray(args) ? args[0][key] : args[key]))
  )
}

/* --------------------------------------- *\
 * #Message
\* --------------------------------------- */
type MessageThis = typeof message | typeof message.self

function messageSend<T extends MsgType, R = MessageResponse<T>>(
  message: Message<T>
): Promise<R>
function messageSend<T extends MsgType, R = MessageResponse<T>>(
  tabId: number,
  message: Message<T>
): Promise<R>
function messageSend<T extends MsgType>(
  ...args: [Message<T>] | [number, Message<T>]
): Promise<any> {
  let callContext: Error
  if (process.env.DEBUG) {
    callContext = new Error('Message Call Context')
  }
  return (args.length === 1
    ? browser.runtime.sendMessage(args[0])
    : browser.tabs.sendMessage(args[0], args[1])
  ).catch(err => {
    if (process.env.DEBUG) {
      console.warn(err.message, ...args, callContext)
    }
  })
}

async function messageSendSelf<T extends MsgType, R = undefined>(
  message: Message<T>
): Promise<R extends undefined ? MessageResponse<T> : R> {
  let callContext: Error
  if (process.env.DEBUG) {
    callContext = new Error('Message Call Context')
  }

  if (window.pageId === undefined) {
    await initClient()
  }
  return browser.runtime
    .sendMessage(
      Object.assign({}, message, {
        __pageId__: window.pageId,
        type: `[[${message.type}]]`
      })
    )
    .catch(err => {
      if (process.env.DEBUG) {
        console.warn(err.message, message, callContext)
      }
    })
}

function messageAddListener<T extends MsgType>(
  messageType: T,
  cb: onMessageEvent<Message<T>>
): void
function messageAddListener<T extends MsgType>(
  cb: onMessageEvent<Message>
): void
function messageAddListener<T extends MsgType>(
  this: MessageThis,
  ...args: [T, onMessageEvent<Message<T>>] | [onMessageEvent<Message>]
): void {
  if (window.pageId === undefined) {
    initClient()
  }
  const allListeners = this.__self__ ? messageSelfListeners : messageListeners
  const messageType = args.length === 1 ? undefined : args[0]
  const cb = args.length === 1 ? args[0] : args[1]
  let listeners = allListeners.get(cb)
  if (!listeners) {
    listeners = new Map()
    allListeners.set(cb, listeners)
  }
  let listener = listeners.get(messageType || '__DEFAULT_MSGTYPE__')
  if (!listener) {
    listener = ((message, sender) => {
      if (
        message &&
        (this.__self__
          ? window.pageId === message.__pageId__
          : !message.__pageId__)
      ) {
        if (messageType == null || message.type === messageType) {
          return cb(message as Message<T> & { __pageId__?: string }, sender)
        }
      }
    }) as onMessageEvent
    listeners.set(messageType || '__DEFAULT_MSGTYPE__', listener)
  }
  // object is handled
  return browser.runtime.onMessage.addListener(listener as any)
}

function messageRemoveListener(
  messageType: Message['type'],
  cb: onMessageEvent
): void
function messageRemoveListener(cb: onMessageEvent): void
function messageRemoveListener(
  this: MessageThis,
  ...args: [Message['type'], onMessageEvent] | [onMessageEvent]
): void {
  const allListeners = this.__self__ ? messageSelfListeners : messageListeners
  const messageType = args.length === 1 ? undefined : args[0]
  const cb = args.length === 1 ? args[0] : args[1]
  const listeners = allListeners.get(cb)
  if (listeners) {
    if (messageType) {
      const listener = listeners.get(messageType)
      if (listener) {
        // @ts-ignore
        browser.runtime.onMessage.removeListener(listener)
        listeners.delete(messageType)
        if (listeners.size <= 0) {
          allListeners.delete(cb)
        }
        return
      }
    } else {
      // delete all cb related callbacks
      listeners.forEach(listener =>
        // @ts-ignore
        browser.runtime.onMessage.removeListener(listener)
      )
      allListeners.delete(cb)
      return
    }
  }
  // @ts-ignore
  browser.runtime.onMessage.removeListener(cb)
}

function messageCreateStream<T extends MsgType>(
  messageType?: T
): Observable<Message<T>>
function messageCreateStream<T extends MsgType>(
  this: MessageThis,
  messageType?: T
): Observable<Message<T>> {
  const pattern$ = messageType
    ? fromEventPattern<Message<T>>(
        handler => this.addListener(messageType, handler),
        handler => this.removeListener(messageType, handler)
      )
    : fromEventPattern<Message<T>>(
        handler => this.addListener(handler),
        handler => this.removeListener(handler)
      )
  // Arguments could be an array if there are multiple values emitted.
  return pattern$.pipe(map(args => (Array.isArray(args) ? args[0] : args)))
}

/**
 * Deploy page script for self-messaging
 * This method is called on the first sendMessage
 */
function initClient(): Promise<typeof window.pageId> {
  if (window.pageId === undefined) {
    return message
      .send<'PAGE_INFO'>({ type: 'PAGE_INFO' })
      .then(({ pageId, faviconURL, pageTitle, pageURL }) => {
        window.pageId = pageId
        window.faviconURL = faviconURL
        if (pageTitle) {
          window.pageTitle = pageTitle
        }
        if (pageURL) {
          window.pageURL = pageURL
        }
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
function initServer(): void {
  window.pageId = 'background page'
  const selfMsgTester = /^\[\[(.+)\]\]$/

  browser.runtime.onMessage.addListener(
    (message: object, sender: browser.runtime.MessageSender) => {
      if (!message || !message['type']) {
        return
      }

      if ((message as Message).type === 'PAGE_INFO') {
        return Promise.resolve(_getPageInfo(sender))
      }

      const selfMsg = selfMsgTester.exec((message as Message).type)
      if (selfMsg) {
        ;(message as Mutable<Message>).type = selfMsg[1] as MsgType
        const tabId = sender.tab && sender.tab.id
        if (tabId) {
          return messageSend(tabId, message as Message)
        } else {
          return messageSend(message as Message)
        }
      }
    }
  )
}

function _getPageInfo(sender: browser.runtime.MessageSender) {
  const result = {
    pageId: '' as string | number,
    faviconURL: '',
    pageTitle: '',
    pageURL: ''
  }
  const tab = sender.tab
  if (tab) {
    result.pageId = tab.id || ''
    if (tab.favIconUrl) {
      result.faviconURL = tab.favIconUrl
    }
    if (tab.url) {
      result.pageURL = tab.url
    }
    if (tab.title) {
      result.pageTitle = tab.title
    }
  } else {
    // FRAGILE: Assume only browser action page is tabless
    result.pageId = 'popup'
    if (sender.url && !sender.url.startsWith('http')) {
      result.faviconURL = 'https://saladict.crimx.com/favicon.ico'
    }
  }
  return result
}
