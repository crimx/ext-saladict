import {storage, message} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'

// background script as transfer station
const msgChecker = /_SELF$/
message.listen((data, sender, sendResponse) => {
  if (msgChecker.test(data.msg)) {
    data.msg = data.msg.slice(0, -5)
    if (sender.tab) {
      message.send(sender.tab.id, data, response => {
        sendResponse(response)
      })
    } else {
      message.send(data, response => {
        sendResponse(response)
      })
    }
    return true
  }

  switch (data.msg) {
    case 'CREATE_TAB':
      chrome.tabs.create({url: data.url})
      break
    case 'AUDIO_PLAY':
      let audio = new Audio(data.src)
      let timer = setTimeout(() => {
        timer = null
        sendResponse()
      }, 4000)
      audio.addEventListener('ended', () => {
        if (timer) {
          clearTimeout(timer)
          sendResponse()
        }
      })
      audio.play()
      return true
  }
})

const _dicts = {}
// dynamic load components
const _compReq = require.context('src/dictionaries', true, /\/engine\.js$/i)
Object.keys(defaultConfig.dicts.all).forEach(id => {
  _dicts[id] = {
    // lazy load
    search (...args) {
      this.search = _compReq(`./${id}/engine.js`)
      if (typeof this.search !== 'function') {
        this.search = this.search.default
      }
      return this.search(...args)
    },
    config: JSON.parse(JSON.stringify(defaultConfig))
  }
})

function setConfigs (config) {
  Object.keys(_dicts).forEach(id => {
    _dicts[id].config = JSON.parse(JSON.stringify(config))
  })
}

function setContextMenu (config) {
  chrome.contextMenus.removeAll()

  config.contextMenu.selected.forEach(id => {
    chrome.contextMenus.create({
      id,
      title: chrome.i18n.getMessage('context_' + id) || id,
      contexts: ['selection']
    })
  })

  chrome.contextMenus.create({
    id: 'google_page_translate',
    title: chrome.i18n.getMessage('context_google_page_translate') || 'Google Page Translate',
    contexts: ['all']
  })
}

storage.sync.get('config', data => {
  let config = data.config

  if (config) {
    setConfigs(config)
    setContextMenu(config)

    // listen context menu
    chrome.contextMenus.onClicked.addListener(({menuItemId, selectionText}) => {
      if (menuItemId === 'google_page_translate') {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          if (tabs && tabs[0]) {
            chrome.tabs.create({url: `https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&ie=UTF-8&u=${tabs[0].url}&edit-text=&act=url`})
          }
        })
        return
      }

      let url = config.contextMenu.all[menuItemId]
      if (url) {
        chrome.tabs.create({url: url.replace('%s', selectionText)})
      }
    })
  }
})

storage.listen('config', changes => {
  let config = changes.config.newValue
  if (config) {
    setConfigs(config)
    setContextMenu(config)
  }
})

message.on('FETCH_DICT_RESULT', (data, sender, sendResponse) => {
  let dict = _dicts[data.dict]
  if (!dict) {
    sendResponse({error: 'Missing Dictionary!'})
    return
  }

  function handleSuccess (result) {
    sendResponse({result, dict: data.dict})
  }

  function handleError (error) {
    sendResponse({error, dict: data.dict})
  }

  dict.search(data.text, dict.config)
    .then(handleSuccess)
    .catch(handleError)

  // keep the channel alive
  return true
})

// merge config on installed
chrome.runtime.onInstalled.addListener(() => {
  storage.sync.get('config', ({config}) => {
    if (config && config.dicts && config.dicts.all) {
      // got the correct version of config
      config = mergeConfig(config)
    } else {
      storage.local.clear()
      storage.sync.clear()
      config = defaultConfig
    }

    // fix historical problems
    Object.keys(config.dicts.all).forEach(id => {
      config.dicts.all[id].preferredHeight = Number(config.dicts.all[id].preferredHeight)
    })
    config.dicts.all.urban.options.resultnum = Number(config.dicts.all.urban.options.resultnum)

    storage.sync.set({config})
    setConfigs(config)

    function mergeConfig (config) {
      var base = JSON.parse(JSON.stringify(defaultConfig))
      if (config.active !== undefined) { base.active = Boolean(config.active) }
      if (/^(icon|direct|double|ctrl)$/i.test(config.mode)) { base.mode = config.mode.toLowerCase() }
      if (config.tripleCtrl !== undefined) { base.tripleCtrl = Boolean(config.tripleCtrl) }
      if (config.language) {
        Object.keys(base.language).forEach(k => {
          if (config.language[k] !== undefined) { base.language[k] = Boolean(config.language[k]) }
        })
      }

      if (config.dicts) {
        if (Array.isArray(config.dicts.selected)) {
          let selected = config.dicts.selected.filter(id => base.dicts.all[id])
          if (selected.length > 0) { base.dicts.selected = selected }
        }
        if (config.dicts.all) {
          Object.keys(base.dicts.all).forEach(id => {
            let dict = config.dicts.all[id]
            if (!dict) { return }
            let baseDict = base.dicts.all[id]
            if (!String(dict.page)) { baseDict.page = String(dict.page) }
            if (dict.defaultUnfold !== undefined) { baseDict.defaultUnfold = Boolean(dict.defaultUnfold) }
            if (!isNaN(Number(dict.preferredHeight))) { baseDict.preferredHeight = Number(dict.preferredHeight) }
            if (dict.options) {
              Object.keys(baseDict.options).forEach(opt => {
                if (typeof dict.options[opt] === 'boolean') {
                  if (dict.options[opt] !== undefined) { baseDict.options[opt] = Boolean(dict.options[opt]) }
                } else if (typeof dict.options[opt] === 'number') {
                  if (!isNaN(dict.options[opt])) { baseDict.options[opt] = Number(dict.options[opt]) }
                }
              })
            }
          })
        }
      }

      if (config.contextMenu) {
        if (Array.isArray(config.contextMenu.selected)) {
          let selected = config.contextMenu.selected.filter(id => base.contextMenu.all[id])
          if (selected.length > 0) { base.contextMenu.selected = selected }
        }
      }

      return base
    }
  })
})
