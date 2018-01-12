/**
 * Fake background script messaging.
 * This script is prepended to background script(if exist).
 * Only other pages should receive messages sent from background script
 */
import _ from 'lodash'

// shadow the global
let browser = _.cloneDeep(window.browser)

browser.runtime.onMessage = {
  addListener (listener) {
    if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
    if (!_.some(window.msgBackgroundListeners, x => x === listener)) {
      window.msgBackgroundListeners.push(listener)
    }
  },
  removeListener (listener) {
    if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
    window.msgBackgroundListeners = _.filter(window.msgBackgroundListeners, x => x !== listener)
  },
  hasListener (listener) {
    if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
    return _.some(window.msgBackgroundListeners, x => x === listener)
  }
}

browser.runtime.sendMessage = (extensionId, message) => {
  return new Promise((resolve, reject) => {
    if (!_.isString(extensionId)) {
      message = extensionId
    }
    try {
      message = JSON.parse(JSON.stringify(message))
    } catch (err) {
      return reject(new TypeError('Wrong argument type'))
    }

    let isClosed = false
    let isAsync = false
    function sendResponse (response) {
      if (isClosed) { return reject(new Error('Attempt to response a closed channel')) }
      try {
        // deep clone & check data
        response = JSON.parse(JSON.stringify(response))
      } catch (err) {
        return reject(new TypeError('Response data not serializable'))
      }
      resolve(response)
    }

    _.each(window.msgPageListeners, listener => {
      const hint = listener(message, {}, sendResponse)
      // return true or Promise to send a response asynchronously
      if (hint === true) {
        isAsync = true
      } else if (hint &&  _.isFunction(hint.then)) {
        isAsync = true
        hint.then(sendResponse)
      }
    })

    // close synchronous response
    setTimeout(() => {
      if (!isAsync) { isClosed = true }
    }, 0)
  })
}

// FRAGILE: Assuming all tab messages are sent to the tab that is under development
// Filter out messages here if you need to narrow down
browser.tabs.sendMessage = (tabId, message) => {
  if (!_.isString(tabId)) { return Promise.reject(new TypeError('Wrong argument type')) }
  return browser.runtime.sendMessage(tabId, message)
}
