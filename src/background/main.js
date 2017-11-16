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
    case 'PAGE_ID':
      return sendResponse(getPageId(sender))
  }
})

// listen context menu
chrome.contextMenus.onClicked.addListener(({menuItemId, selectionText, linkUrl}) => {
  if (menuItemId === 'google_page_translate') {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (tabs.length > 0) {
        chrome.tabs.create({url: `https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&ie=UTF-8&u=${tabs[0].url}&edit-text=&act=url`})
      }
    })
  } else if (menuItemId === 'youdao_page_translate') {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (tabs.length > 0) {
        message.send(tabs[0].id, {msg: 'LOAD-YOUDAO-PAGE'})
      }
    })
  } else if (menuItemId === 'view_as_pdf') {
    var url = chrome.runtime.getURL('assets/pdf/web/viewer.html')
    if (linkUrl) {
      // open link as pdf
      chrome.tabs.create({url: url + '?file=' + linkUrl})
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        // if it is a pdf page
        if (tabs.length > 0 && /\.pdf$/i.test(tabs[0].url)) {
          chrome.tabs.create({url: url + '?file=' + tabs[0].url})
        } else {
          chrome.tabs.create({url})
        }
      })
    }
  } else {
    storage.sync.get('config', ({config}) => {
      const url = config.contextMenu.all[menuItemId]
      if (url) {
        chrome.tabs.create({url: url.replace('%s', selectionText)})
      }
    })
  }
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
chrome.runtime.onInstalled.addListener(({reason}) => {
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
          chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
        } else if (reason === 'update') {
          showNews()
        }
        setContextMenu(config)
      })
  })
})

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki#%E6%94%AF%E6%8C%81%E5%9B%9B%E7%A7%8D%E5%88%92%E8%AF%8D%E6%96%B9%E5%BC%8F%E6%94%AF%E6%8C%81-iframe-%E5%88%92%E8%AF%8D'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

function setContextMenu (config) {
  chrome.contextMenus.removeAll(() => {
    // pdf
    chrome.contextMenus.create({
      id: 'view_as_pdf',
      title: chrome.i18n.getMessage('context_view_as_pdf') || 'view_as_pdf',
      contexts: ['link', 'browser_action']
    })

    var hasGooglePageTranslate = false
    var hasYoudaoPageTranslate = false
    config.contextMenu.selected.forEach(id => {
      var contexts = ['selection']
      if (id === 'google_page_translate') {
        hasGooglePageTranslate = true
        contexts = ['all']
      } else if (id === 'youdao_page_translate') {
        hasYoudaoPageTranslate = true
        contexts = ['all']
      }
      chrome.contextMenus.create({
        id,
        title: chrome.i18n.getMessage('context_' + id) || id,
        contexts
      })
    })

    // Only for browser action
    if (!hasGooglePageTranslate) {
      chrome.contextMenus.create({
        id: 'google_page_translate',
        title: chrome.i18n.getMessage('context_google_page_translate') || 'google_page_translate',
        contexts: ['browser_action']
      })
    }
    if (!hasYoudaoPageTranslate) {
      chrome.contextMenus.create({
        id: 'youdao_page_translate',
        title: chrome.i18n.getMessage('context_youdao_page_translate') || 'youdao_page_translate',
        contexts: ['browser_action']
      })
    }
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
      '已更新到【5.20.0】\n' +
      '1. 增加有道网页翻译2.0（支持 HTTPS）\n' +
      '2. '
    ),
    buttons: [{title: '点击了解使用方式'}]
  })
}

function getPageId (sender) {
  if (sender.tab) {
    return sender.tab.id
  } else {
    return 'popup'
  }
}

function mergeConfig (config) {
  var base = JSON.parse(JSON.stringify(defaultConfig))
  if (config.active !== undefined) { base.active = Boolean(config.active) }
  if (/^(icon|direct|double|ctrl)$/i.test(config.mode)) { base.mode = config.mode.toLowerCase() }
  if (typeof config.doubleClickDelay === 'number' && !isNaN(config.doubleClickDelay)) {
    base.doubleClickDelay = config.doubleClickDelay
  }
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
        if (dict.showWhenLang) {
          Object.keys(baseDict.showWhenLang).forEach(opt => {
            if (typeof dict.showWhenLang[opt] === 'boolean') {
              baseDict.showWhenLang[opt] = dict.showWhenLang[opt]
            }
          })
        }
        if (dict.options) {
          Object.keys(baseDict.options).forEach(opt => {
            if (typeof dict.options[opt] === 'boolean') {
              baseDict.options[opt] = dict.options[opt]
            } else if (typeof dict.options[opt] === 'number' && !isNaN(dict.options[opt])) {
              baseDict.options[opt] = Number(dict.options[opt])
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

    // added at v5.20.0, enable by default
    if (!config.contextMenu.all['youdao_page_translate']) {
      base.contextMenu.selected.push('youdao_page_translate')
    }
  }

  return base
}
