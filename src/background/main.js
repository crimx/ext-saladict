import {storage, message} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'

// background script as transfer station
message.listen((data, sender, sendResponse) => {
  if (/_SELF$/.test(data.msg)) {
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
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(data, sender, sendResponse)
  }
})

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

  storage.sync.get('config', ({config}) => {
    const url = config.contextMenu.all[menuItemId]
    if (url) {
      chrome.tabs.create({url: url.replace('%s', selectionText)})
    }
  })
})

storage.listen('config', ({config: {newValue, oldValue}}) => {
  if (!oldValue) {
    return setContextMenu(newValue)
  }

  const oldSelected = oldValue.contextMenu.selected
  const newSelected = newValue.contextMenu.selected
  if (oldSelected.length !== newSelected.length) {
    return setContextMenu(newValue)
  }
  for (let i = 0; i < oldSelected.length; i += 1) {
    if (oldSelected[i] !== newSelected[i]) {
      return setContextMenu(newValue)
    }
  }
})

// merge config on installed
chrome.runtime.onInstalled.addListener(({OnInstalledReason}) => {
  let isNew = false
  storage.sync.get('config', ({config}) => {
    if (config && config.dicts && config.dicts.all) {
      // got the correct version of config
      config = mergeConfig(config)
    } else {
      storage.local.clear()
      storage.sync.clear()
      config = JSON.parse(JSON.stringify(defaultConfig))
      isNew = true
    }

    // fix historical problems
    Object.keys(config.dicts.all).forEach(id => {
      config.dicts.all[id].preferredHeight = Number(config.dicts.all[id].preferredHeight)
    })
    config.dicts.all.urban.options.resultnum = Number(config.dicts.all.urban.options.resultnum)

    storage.sync.set({config})
      .then(() => {
        if (isNew) {
          chrome.tabs.create({url: chrome.runtime.getURL('options.html')})
        } else if (OnInstalledReason === 'update') {
          showNews()
        }
        setContextMenu(config)
      })
  })
})

function setContextMenu (config) {
  chrome.contextMenus.removeAll(() => {
    config.contextMenu.selected.forEach(id => {
      chrome.contextMenus.create({
        id,
        title: chrome.i18n.getMessage('context_' + id) || id,
        contexts: [id === 'google_page_translate' ? 'all' : 'selection']
      })
    })
  })
}

function fetchDictResult (data, sender, sendResponse) {
  const search = require('src/dictionaries/' + data.dict + '/engine.js').default
  if (!search) {
    sendResponse({error: 'Missing Dictionary!'})
    return
  }

  storage.sync.get('config', ({config}) => {
    search(data.text, config)
      .then(result => sendResponse({result, dict: data.dict}))
      .catch(error => sendResponse({error, dict: data.dict}))
  })

  // keep the channel alive
  return true
}

function showNews () {
  chrome.notifications.create({
    requireInteraction: true,
    type: 'basic',
    iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
    title: '沙拉查词 Saladict',
    message: (
      '已更新到【5.15.19】\n' +
      '1. 修复百度搜索页面被吞掉\n' +
      '2. 点击发音\n' +
      '3. 更新 etymonline 词典'
    )
  })
}

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
      if (config.contextMenu.selected.length <= 0) {
        base.contextMenu.selected = []
      } else {
        let selected = config.contextMenu.selected.filter(id => base.contextMenu.all[id])
        if (selected.length > 0) { base.contextMenu.selected = selected }
      }
    }
  }

  return base
}
