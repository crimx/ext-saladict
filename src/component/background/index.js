'use strict'

var pkg = require('../../../package.json')

// load engines
var engines = {
  bing: require('./engines/bing'),
  vocabulary: require('./engines/vocabulary'),
  ud: require('./engines/ud'),
  howjsay: require('./engines/howjsay'),
  dictcn: require('./engines/dictcn')
}

var audioPlay

// request format as follows:
var msgOpts = {
  /* 
   * request audio play:
   *   msg[string]: 'audioPlay'
   *   url[string]: audio src
   */
  audioPlay: function(request, sender, sendResponse) {
    if (typeof request.url !== 'string') {
      sendResponse({msg: null})
      return
    }
    if (audioPlay) {
      audioPlay.pause()
    }
    audioPlay = new Audio(request.url)
    audioPlay.play()
    sendResponse({
      msg: 'success',
      url: request.url
    })
  },
  /* 
   * request translated result:
   *   msg[string]: 'translate'
   *   id[string]: engine ID
   *   text[string]: search text
   */
  translate: function(request, sender, sendResponse) {
    var id = request.id || 'bing'
    var text = request.text || null
    engines[id](text, sendResponse)
  },
  /* 
   * request app config result:
   *   msg[string]: 'grab'
   *   items[string or array of string or object keys]: keys
   */
  grab: function(request, sender, sendResponse) {
    // null means get the entire contents of storage
    var items = request.items || null

    chrome.storage.local.get(items, function (localData) {
      if (Object.keys(localData).length) {
        sendResponse({
          msg: 'success',
          data: localData
        })
      } else {
        chrome.storage.sync.get(items, function (syncData) {
          if (Object.keys(syncData).length) {
            sendResponse({
              msg: 'success',
              data: syncData
            })
          } else {
            sendResponse({msg: null})
          }
        })
      }
    })
  },
  /* 
   * request open a page in new tab:
   *   msg[string]: 'newTab'
   *   url[string]: page url
   */
  newTab: function(request, sender, sendResponse) {
    if (request.url) {
      chrome.tabs.create({url: request.url}, function() {
        sendResponse({msg: 'success'})
      })
    } else {
      sendResponse({msg: null})
    }
  },
  /* 
   * request data saving:
   *   msg[string]: 'save'
   *   items: An object which gives each key/value pair to update storage with
   */
  save: function(request, sender, sendResponse) {
    var items = request.items
    if (items) {
      chrome.storage.local.set(items, function () {
        var data = {
          msg: 'appStateChanged',
          data: items
        }
        // broadcast app state
        chrome.runtime.sendMessage(data)
        // send to content srcipt
        chrome.tabs.query({/* get all the tabs */}, function(tabs) {
          tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, data)
          })
        })
        sendResponse({msg: 'success'})
      })
      chrome.storage.sync.set(items)
    } else {
      sendResponse({msg: null})
    }
  }
}

// listen request event
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {    
    if (request.msg in msgOpts && msgOpts.hasOwnProperty(request.msg)) {
      msgOpts[request.msg](request, sender, sendResponse)
      return true // Let sender keep the channel open until sendResponse is called
    } else {
      sendResponse({msg: null})
    }
  })

// nitifications clickable
chrome.notifications.onClicked.addListener(function() {
  chrome.tabs.create({url: pkg.homepage})
})

// first time setup
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install' || details.reason === 'update') {
    // update notification
    var title = chrome.i18n.getMessage('update_title')
    var opt = {
      type: 'list',
      title: title + pkg.version,
      message: title + pkg.version,
      eventTime: Date.now() + 10000,
      isClickable: true,
      iconUrl: 'images/icon-128.png',
      items: []
    }
    var msg = ''
    for (var i = 1; msg = chrome.i18n.getMessage('update_message'+i); i += 1) {
      opt.items.push({ title: i + '. ', message: msg})
    }
    chrome.notifications.create(opt)
  }
})

chrome.runtime.onUpdateAvailable.addListener(function() {
  chrome.notifications.create({
    type: 'basic',
    title: chrome.i18n.getMessage('extension_name') + ' v' + pkg.version,
    message: chrome.i18n.getMessage('update_available'),
    eventTime: Date.now() + 10000,
    isClickable: true,
    iconUrl: 'images/icon-128.png'
  })
})

// create context menu
chrome.contextMenus.create({
  id: 'saladict_oxford',
  title: 'Oxford Dictionary',
  contexts: ['selection']
})

chrome.contextMenus.create({
  id: 'saladict_bing',
  title: 'Bing Dict',
  contexts: ['selection']
})

chrome.contextMenus.create({
  id: 'saladict_google',
  title: 'Google Translate',
  contexts: ['selection']
})

chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === 'saladict_oxford') {
    chrome.tabs.create({url: 'http://www.oxforddictionaries.com/us/definition/english/' + info.selectionText})
  } else if (info.menuItemId === 'saladict_google') {
    chrome.tabs.create({url: 'https://translate.google.com/#auto/zh-CN/' + info.selectionText})
  } else if (info.menuItemId === 'saladict_bing') {
    chrome.tabs.create({url: 'http://cn.bing.com/dict/?q=' + info.selectionText})
  }
})
