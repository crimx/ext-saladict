import {storage, message} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'

// background script as transfer station
const msgChecker = /_SELF$/
message.listen((data, sender, sendResponse) => {
  if (msgChecker.test(data.msg)) {
    data.msg = data.msg.slice(0, -5)
    message.send(sender.tab.id, data, response => {
      sendResponse(response)
    })
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
const _compReq = require.context('./dicts', true, /\.js$/i)
const _idChecker = /\/(\S+)\.js$/i
_compReq.keys().forEach(path => {
  let id = _idChecker.exec(path)
  if (!id) { return }
  id = id[1].toLowerCase()
  if (!defaultConfig.dicts.all[id]) { return }

  let search = _compReq(path)
  if (typeof search !== 'function') {
    search = search.default
  }
  _dicts[id] = {
    search,
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
      title: chrome.i18n.getMessage('context_' + id),
      contexts: ['selection']
    })
  })

  chrome.contextMenus.create({
    id: 'google_page_translate',
    title: chrome.i18n.getMessage('context_google_page_translate'),
    contexts: ['all']
  })
}

storage.sync.get('config', data => {
  let config = data.config

  if (config) {
    setConfigs(config)
    setContextMenu(config)

    // listen context menu
    chrome.contextMenus.onClicked.addListener(({menuItemId, selectionText, pageUrl}) => {
      if (menuItemId === 'google_page_translate') {
        chrome.tabs.create({url: `https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&ie=UTF-8&u=${pageUrl}&edit-text=&act=url`})
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
    .then(handleSuccess, handleError)
    .catch(handleError)

  // keep the channel alive
  return true
})

// merge config on installed
chrome.runtime.onInstalled.addListener(({previousVersion}) => {
  let config = defaultConfig
  let [major, minor, patch] = previousVersion ? previousVersion.split('.').map(n => Number(n)) : [0, 0, 0]
  if (major <= 4) {
    storage.local.clear()
    storage.sync.clear()
      .then(() => {
        storage.sync.set({config})
        setConfigs(config)
      })
  } else if (major === 5) {
    storage.sync.get('config', data => {
      let config = data.config

      if (config) {
        if (minor < 3) {
          // 5.3 added
          config.dicts.all.howjsay = defaultConfig.dicts.all.howjsay
        }
        if (minor < 5) {
          config.dicts.all.eudic = defaultConfig.dicts.all.eudic
        }
      } else {
        config = defaultConfig
      }

      storage.sync.set({config})
      setConfigs(config)
    })
  }
})
