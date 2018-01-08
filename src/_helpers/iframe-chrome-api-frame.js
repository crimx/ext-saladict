/**
 * Wraps chrome extension apis with iframe messaging
 */

var responseCbs = {}
var storageChangeCbs = []

export const storage = {
  sync: {
    get: storageGet('sync'),
    set: storageSet('sync')
  },
  local: {
    get: storageGet('local'),
    set: storageSet('local')
  },
  listen: storageListen,
  addListener: storageListen,
  on: storageListen
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
  on: messageListen
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
   * @see https://developer.chrome.com/extensions/storage#type-StorageArea
   */
  return function get (keys, cb) {
    if (typeof keys === 'function') {
      cb = keys
      keys = undefined
    }

    function _get (cb) {
      const timeStamp = Date.now()

      responseCbs[timeStamp] = cb

      window.parent.postMessage({
        msg: 'SALADICT_SOTRAGE_GET',
        storageArea,
        keys,
        timeStamp
      }, '*')
    }

    if (typeof cb === 'function') {
      _get(data => cb(data.items))
    } else {
      return new Promise((resolve, reject) => {
        _get(data => {
          if (data.error) {
            reject(data.error)
          } else if (!data || Object.keys(data).length < 1) {
            reject({})
          } else {
            resolve(data.items)
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
   * @see https://developer.chrome.com/extensions/storage#type-StorageArea
   */
  return function set (items, cb) {
    function _set (cb) {
      const timeStamp = Date.now()

      // let listener = window.addEventListener('message', evt => {
      //   const data = evt.data
      //   if (data.timeStamp === timeStamp) {
      //     cb(data)
      //     window.removeEventListener('message', listener, false)
      //   }
      // }, false)

      responseCbs[timeStamp] = cb

      window.parent.postMessage({
        msg: 'SALADICT_SOTRAGE_SET',
        storageArea,
        items,
        timeStamp
      }, '*')
    }

    if (typeof cb === 'function') {
      _set(cb)
    } else {
      return new Promise((resolve, reject) => {
        _set(data => {
          if (data.error) {
            reject(data.error)
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
    storageChangeCbs.push(cb)
  } else if (typeof cb === 'function') {
    storageChangeCbs.push((changes, areaName) => {
      if (changes[key]) {
        cb(changes, areaName)
      }
    })
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
    // runtime
    cb = message
    message = tabId
    tabId = undefined
  }

  function _send (cb) {
    const timeStamp = Date.now()

    responseCbs[timeStamp] = cb

    window.parent.postMessage({
      msg: 'SALADICT_MSG_SEND',
      tabId,
      message,
      timeStamp
    }, '*')
  }

  if (typeof cb === 'function') {
    return _send(data => cb(data.response))
  } else {
    return new Promise((resolve, reject) => {
      _send(data => {
        if (data.error) {
          reject(data.error)
        } else {
          resolve(data.response)
        }
      })
    })
  }
}

/**
 * Listens to a specific message or uses the generic onMessage.addListener
 * @param {string|number} [message] message to listen to
 * @param {function} cb callback function
 * @param {Boolean} [isResopnse] will send response? So that the channel will keep open. Can't directly pass sendResponse.
 * @see https://developer.chrome.com/extensions/runtime#event-onMessage
 */
function messageListen (message, cb, isResopnse) {
  if (typeof message === 'function') {
    cb = message
    isResopnse = cb
    message = undefined
  }

  if (typeof cb === 'function') {
    let timeStamp = Date.now()
    window.parent.postMessage({
      msg: 'SALADICT_MESSAGE_LISTEN',
      timeStamp,
      message,
      isResopnse
    }, '*')

    responseCbs[timeStamp] = ({receivedMsg, sender}) => {
      if (!message || (receivedMsg && receivedMsg.msg === message)) {
        cb(receivedMsg, sender, responseMsg => {
          window.parent.postMessage({
            msg: 'SALADICT_MESSAGE_RESPONSE',
            timeStamp,
            message: responseMsg
          }, '*')
        })
      }
    }
  }
}

window.addEventListener('message', evt => {
  const data = evt.data
  switch (data.msg) {
    case 'SALADICT_SOTRAGE_CHANGE':
      storageChangeCbs.forEach(cb => cb(data.changes, data.areaName))
      break
    case 'SALADICT_RESPONSE':
      let cb = responseCbs[data.timeStamp]
      if (typeof cb === 'function') {
        cb(data)
        delete responseCbs[data.timeStamp]
      }
      break
  }
}, false)
