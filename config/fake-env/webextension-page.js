/**
 * Mainly for tweaking UI
 * Since there are still no decent mock suite for Webextension,
 * I faked a subset of common apis by hand to mimic the behaviours.
 */
import _ from 'lodash'
import locales from '../../src/_locales/messages.json'

const platform = navigator.userAgent.indexOf('Chrome') !== -1 ? 'chrome' : 'firefox'

// Tabs and runtime share the same message tunnel since we are developing only one page.
// Messages won't be sent back to its own script so we use two tunnels here.
window.msgPageListeners = window.msgPageListeners || []
window.msgBackgroundListeners = window.msgBackgroundListeners || []

window.browser = {
  browserAction: {
    setTitle () {},
    setBadgeText () {},
    getBadgeText (x, cb) { cb(Date.now().toString()) },
    setBadgeBackgroundColor () {},
  },
  contextMenus: {
    onClicked: {
      addListener () {},
      hasListener () {},
      removeListener () {},
    },
    removeAll () { return Promise.resolve() },
    create () { return Promise.resolve() },
  },
  i18n: {
    getMessage (k) { return locales[k] && locales[k].message.zh_CN },
    getUILanguage () { return 'zh_CN' },
  },
  notifications: {
    create: _.partial(console.log, 'create notifications:'),
    onClicked: {
      addListener () {},
    },
  },
  storage: genStorageApis(),
  tabs: {
    create ({url}) {
      window.open(url || '')
      return Promise.resolve({
        active: true,
        url: url,
        id: String(Date.now()),
        // ... add other info accordingly
      })
    },
    query () { return Promise.resolve([]) },
    highlight () { return Promise.resolve() },
    // No other tab to receive anyway
    sendMessage () { return Promise.resolve() }
  },
  webRequest: {
    onBeforeRequest: {
      addListener () {},
      hasListener () {},
      removeListener () {},
    },
    onHeadersReceived: {
      addListener () {},
      hasListener () {},
      removeListener () {},
    },
  },
  runtime: {
    id: 'mdidnbkkjainbfbcenphabdajogedcnx',
    getURL (name) { return name },
    getManifest () {
      return _.assign(
        {},
        require(`../../src/manifest/common.manifest.json`),
        require('../../src/manifest/' + platform + '.manifest.json'),
      )
    },
    reload () { window.location.reload(true) },
    onStartup: {
      addListener (listener) {
        if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
        // delay startup calls
        setTimeout(listener, 0)
      }
    },
    onInstalled: {
      addListener (listener) {
        if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
        listener({reason: 'install'})
      }
    },
    sendMessage,
    onMessage: {
      addListener (listener) {
        if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
        if (!_.some(window.msgPageListeners, x => x === listener)) {
          window.msgPageListeners.push(listener)
        }
      },
      removeListener (listener) {
        if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
        window.msgPageListeners = _.filter(window.msgPageListeners, x => x !== listener)
      },
      hasListener (listener) {
        if (!_.isFunction(listener)) { throw new TypeError('Wrong argument type') }
        return _.some(window.msgPageListeners, x => x === listener)
      },
    },
  },
}

function sendMessage (extensionId, message) {
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
        response = response && JSON.parse(JSON.stringify(response))
      } catch (err) {
        return reject(new TypeError('Response data not serializable'))
      }
      resolve(response)
    }

    _.each(window.msgBackgroundListeners, listener => {
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

/**
 * For both sync and local
 */
function genStorageApis () {
  window['storageData'] = {
    local: {},
    sync: {},
    listeners: [],
  }

  return {
    sync: genStorageAreaApis('sync'),
    local: genStorageAreaApis('local'),
    managed: {
      // if you need to use managed area you should feed your own data
      get: () => ({})
    },
    onChanged: {
      addListener (listener) {
        if (!_.isFunction(listener)) {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        if (!_.some(storageData.listeners, x => x === listener)) {
          storageData.listeners.push(listener)
        }
      },
      removeListener (listener) {
        if (!_.isFunction(listener)) {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        storageData.listeners = _.filter(storageData.listeners, x => x !== listener)
      },
      hasListener (listener) {
        if (!_.isFunction(listener)) {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        return _.some(storageData.listeners, x => x === listener)
      },
    },
  }

  function genStorageAreaApis (area) {
    return {
      get (keys) {
        if (keys == null) {
          return Promise.resolve(_.cloneDeep(storageData[area]))
        }
        if (_.isString(keys)) {
          if (!keys) { return Promise.resolve({}) }
          keys = [keys]
        } else if (_.isArray(keys)) {
          if (keys.length <= 0) { return Promise.resolve({}) }
        } else if (_.isObject(keys)) {
          keys = Object.keys(keys)
          if (keys.length <= 0) { return Promise.resolve({}) }
        } else {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        return Promise.resolve(_.pick(_.cloneDeep(storageData[area]), keys))
      },
      set (keys) {
        if (!_.isObject(keys)) {
          return Promise.reject(new TypeError('Argument 1 should be an object'))
        }
        try {
          // deep clone & check data
          keys = JSON.parse(JSON.stringify(keys))
        } catch (err) {
          return Promise.reject(new TypeError('Data not serializable'))
        }
        const newData = _.assign({}, storageData[area], keys)
        const changes = Object.keys(keys)
          .filter(k => !_.isEqual(newData[k], storageData[area][k]))
          .reduce((x, k) => {
            x[k] = {
              newValue: _.cloneDeep(newData[k]),
              oldValue: _.cloneDeep(storageData[area][k]),
            }
            return x
          }, {})
        if (Object.keys(changes).length > 0) {
          setTimeout(() => alertListeners(changes, area), 0)
        }
        storageData[area] = newData
        return Promise.resolve()
      },
      remove (keys) {
        if (_.isString(keys)) {
          keys = keys ? [keys] : []
        } else if (!_.isArray(keys)) {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        const newData = _.omit(storageData[area], keys)
        const changes = keys
          .filter(k => !_.isUndefined(storageData[area][k]))
          .reduce((x, k) => {
            x[k] = {
              newValue: undefined,
              oldValue: _.cloneDeep(storageData[area][k]),
            }
            return x
          }, {})
        if (changes.length > 0) {
          setTimeout(() => alertListeners(changes, area), 0)
        }
        storageData[area] = newData
        return Promise.resolve()
      },
      clear () {
        const changes = Object.keys(storageData[area])
          .filter(k => !_.isUndefined(storageData[area][k]))
          .reduce((x, k) => {
            x[k] = {
              newValue: undefined,
              oldValue: _.cloneDeep(storageData[area][k]),
            }
            return x
          }, {})
        if (changes.length > 0) {
          setTimeout(() => alertListeners(changes, area), 0)
        }
        storageData[area] = {}
        return Promise.resolve()
      },
      getBytesInUse (keys) {
        if (_.isNull(keys)) {
          return Promise.resolve(new Blob([JSON.stringify(storageData[area])]).size)
        }
        if (_.isString(keys)) {
          keys = keys ? [keys] : []
        } else if (!_.isArray(keys)) {
          return Promise.reject(new TypeError('Wrong argument type'))
        }
        if (keys.length <= 0) {
          return Promise.resolve(0)
        }
        return Promise.resolve(new Blob([JSON.stringify(_.pick(storageData[area], keys))]).size)
      },
    }
  }

  function alertListeners (changes, area) {
    storageData.listeners.forEach(listener => listener(_.cloneDeep(changes), area))
  }
}
