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
  commands: {
    onCommand: {
      addListener () {},
      hasListener () {},
      removeListener () {},
    }
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
  cookies: {
    set: () => Promise.resolve()
  },
  extension: {
    inIncognitoContext: false,
  },
  i18n: {
    getMessage (k) { return locales[k] && locales[k].message.zh_CN },
    getUILanguage () { return 'zh-CN' },
  },
  windows: {
    update: () => Promise.resolve(1),
    create: () => Promise.resolve(1),
    onRemoved: {
      addListener () {},
      hasListener () {},
      removeListener () {},
    }
  },
  notifications: {
    create: _.partial(console.log, 'create notifications:'),
    onClicked: {
      addListener () {},
    },
    onButtonClicked: {
      addListener () {},
    }
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
    getPlatformInfo () { return Promise.resolve({ os: 'win' }) },
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
    local: genLocalStorageData(),
    sync: { hasInstructionsShown: true },
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

function genLocalStorageData () {
  return {
    "1514353044965": {
      "data": [
        {
          "data": [
            {
              "context": "",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "",
              "text": "aural",
              "title": "来自沙拉查词面板",
              "trans": "",
              "url": "#"
            }
          ],
          "date": "03282018"
        },
        {
          "data": [
            {
              "context": "6.5 Taxonomy of WAI-ARIA States and Properties§",
              "favicon": "https://www.w3.org/favicon.ico",
              "note": "",
              "text": "Taxonomy",
              "title": "Accessible Rich Internet Applications (WAI-ARIA) 1.1",
              "trans": "",
              "url": "https://www.w3.org/TR/wai-aria/#introstates"
            }
          ],
          "date": "03242018"
        },
        {
          "data": [
            {
              "context": "An accordion is a vertically stacked set of interactive headings that each contain a title, content snippet, or thumbnail representing a section of content.",
              "favicon": "https://www.w3.org/favicon.ico",
              "note": "",
              "text": "accordion",
              "title": "WAI-ARIA Authoring Practices 1.1",
              "trans": "",
              "url": "https://www.w3.org/TR/wai-aria-practices-1.1/"
            }
          ],
          "date": "03232018"
        },
        {
          "data": [
            {
              "context": "",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "",
              "text": "brochure",
              "title": "来自沙拉查词面板",
              "trans": "",
              "url": "#"
            }
          ],
          "date": "03222018"
        },
        {
          "data": [
            {
              "context": "blab blab bla sd",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "a ha ooo",
              "text": "plateau",
              "title": "来自沙拉查词面板",
              "trans": "tttrxsd dfs dfs fg df ",
              "url": "#"
            }
          ],
          "date": "03192018"
        },
        {
          "data": [
            {
              "context": "blab blab bla sd",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "a ha ooo",
              "text": "plateau",
              "title": "来自沙拉查词面板",
              "trans": "tttrxsd dfs dfs fg df ",
              "url": "#"
            }
          ],
          "date": "03192016"
        },
        {
          "data": [
            {
              "context": "",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "",
              "text": "confetti",
              "title": "来自沙拉查词面板",
              "trans": "",
              "url": "#"
            }
          ],
          "date": "02282018"
        },
        {
          "data": [
            {
              "context": "Some of Harrop's friends and former team-mates, namely Scott McTominay and Axel Tuanzebe, have been afforded the odd opportunity by Mourinho this season, albeit predominantly in cup competitions.",
              "favicon": "",
              "note": "",
              "text": "albeit",
              "title": "[Notes]Why Josh Harrop gambled on Preston ...",
              "trans": "",
              "url": "https://www.douban.com/group/topic/112362869/"
            }
          ],
          "date": "02052018"
        },
        {
          "data": [
            {
              "context": "",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "",
              "text": "punctuated",
              "title": "查词历史记录",
              "trans": "",
              "url": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/history.html"
            }
          ],
          "date": "01232018"
        },
        {
          "data": [
            {
              "context": "",
              "favicon": "chrome-extension://cdonnmffkdaoajfknoeeecmchibpmkmg/assets/icon-16.png",
              "note": "",
              "text": "invariant",
              "title": "来自沙拉查词面板",
              "trans": "xx",
              "url": "#"
            }
          ],
          "date": "12292017"
        },
        {
          "data": [
            {
              "context": "This is so that different parts of the code can’t change the state arbitrarily, causing hard-to-reproduce bugs.",
              "favicon": "https://redux.js.org/gitbook/images/favicon.ico",
              "note": "",
              "text": "arbitrarily",
              "title": "Introduction · Redux",
              "trans": "",
              "url": "https://redux.js.org/docs/introduction/"
            },
            {
              "context": "When a system is opaque and non-deterministic, it's hard to reproduce bugs or add new features.",
              "favicon": "https://redux.js.org/gitbook/images/favicon.ico",
              "note": "",
              "text": "opaque",
              "title": "Introduction · Redux",
              "trans": "",
              "url": "https://redux.js.org/docs/introduction/"
            }
          ],
          "date": "12272017"
        }
      ],
      "id": "1514353044965",
      "wordCount": 11
    },
    "notebookCat": {
      "data": [
        "1514353044965"
      ],
      "timestamp": 1522237783822,
      "version": 2,
      "wordCount": 11
    }
  }
}
