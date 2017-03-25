/**
 * Transfer chrome extension apis requests from iframes
 */

var msgResponseCallbacks = {}

window.addEventListener('message', evt => {
  let data = evt.data
  switch (data.msg) {
    case 'SALADICT_SOTRAGE_GET':
      chrome.storage[data.storageArea].get(data.keys, items => {
        let result = {
          msg: 'SALADICT_RESPONSE',
          timeStamp: data.timeStamp,
          items
        }
        if (chrome.runtime.lastError) {
          result.error = chrome.runtime.lastError.message
        }
        evt.source.postMessage(result, '*')
      })
      break

    case 'SALADICT_SOTRAGE_SET':
      chrome.storage[data.storageArea].set(data.items, () => {
        let result = {
          msg: 'SALADICT_RESPONSE',
          timeStamp: data.timeStamp
        }
        if (chrome.runtime.lastError) {
          result.error = chrome.runtime.lastError.message
        }
        evt.source.postMessage(result, '*')
      })
      break

    case 'SALADICT_SOTRAGE_LISTEN':
      chrome.storage.onChanged.addListener((changes, areaName) => {
        evt.source.postMessage({
          msg: 'SALADICT_SOTRAGE_CHANGE',
          changes,
          areaName
        }, '*')
      })
      break

    case 'SALADICT_MSG_SEND':
      if (data.tabId) {
        chrome.tabs.sendMessage(data.tabId, data.message, response => {
          evt.source.postMessage({
            msg: 'SALADICT_RESPONSE',
            timeStamp: data.timeStamp,
            response
          }, '*')
        })
      } else {
        chrome.runtime.sendMessage(data.message, response => {
          evt.source.postMessage({
            msg: 'SALADICT_RESPONSE',
            timeStamp: data.timeStamp,
            response
          }, '*')
        })
      }
      break

    case 'SALADICT_MESSAGE_LISTEN':
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        evt.source.postMessage({
          msg: 'SALADICT_RESPONSE',
          message,
          sender
        }, '*')
        if (data.isResopnse) {
          msgResponseCallbacks[data.timeStamp] = sendResponse
          return true
        }
      })
      break

    case 'SALADICT_MESSAGE_RESPONSE':
      let sendResponse = msgResponseCallbacks[data.timeStamp]
      if (sendResponse) {
        sendResponse(data.message)
        delete msgResponseCallbacks[data.timeStamp]
      }
      break
  }
}, false)
