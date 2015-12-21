'use strict'

var utils = require('../utils')
var Vue = require('vue')
Vue.config.silent = true

/* start-debug-block */
Vue.config.silent = false
Vue.config.debug = true
/* end-debug-block */

// default config
var config = {
  appActive: true,

  mode: 'icon',
  // icon: show pop icon first
  // direct: show panel directly
  // ctrl: TODO show panel when double click ctrl + selection not empty

  // show panel when triple press ctrl
  tripleCtrl: true,
  
  chineseMode: true,
  englishMode: true
}

// get user config
utils
  .sendMessage({
    msg:'grab',
    items: Object.keys(config)
  })
  .then(function(response) {
    if (response.msg === 'success') {
      setConfig(response.data)
    }
  })

// when user save config on popup panel,
// appStateChanged is triggered
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === 'appStateChanged') {
      setConfig(request.data)
    }
  })


// inject component
var content = new Vue(require('./main'))
content.$mount().$before(document.body.firstChild)

// listen to click
document.body.addEventListener('mouseup', mouseupEventHandler)

// listen to triple ctrl keypress
var tripleCtrlCount = 0
document.body.addEventListener('keyup', tripleCtrlHandler)

function mouseupEventHandler(evt) {
  var el = evt.target
  var newSelection = window.getSelection().toString()

  // app shutdown
  if (!config.appActive) {
    content.isShow = false
    return
  }

  // if clicking inside the panel then do nothing
  do {
    if ((' ' + el.className + ' ').indexOf(' saladict-panel ') > -1) {
      return
    }
    el = el.parentNode
  } while (el)

  if (content.isPinned) {
    if (newSelection) {
      content.pageStatus.selection = newSelection
      content.$broadcast('search', newSelection)
    }
    return
  }

  // empty selection
  if (!newSelection) {
    content.isShow = false
    return
  }

  // Chinese or English Only options
  if ((config.chineseMode && !isContainChinese(newSelection)) &&
      (config.englishMode && !isContainEnglish(newSelection))) {
    content.isShow = false
    return
  }

  // update status, shared
  content.pageStatus.selection = newSelection
  content.pageStatus.clientX = evt.clientX
  content.pageStatus.clientY = evt.clientY

  // show main panel
  content.isShow = true

  // show icon & panel accordingly
  var isIconHidden = true
  var isPanelHidden = true
  if (config.mode === 'icon') {
    isIconHidden = false
  } else if (config.mode === 'direct') {
    isPanelHidden = false
  } else if (config.mode === 'ctrl') {
    // TODO
  }
  content.$nextTick(function() {
    content.$broadcast('icon-hide', isIconHidden)
    content.$broadcast('panel-hide', isPanelHidden)
  })
}

var tripleCtrlTimeout
function tripleCtrlHandler(e) {
  if (e.keyCode === 17) {
    if (++tripleCtrlCount >= 3) {
      // triple!
      content.pageStatus.selection = window.getSelection().toString()
      content.pageStatus.clientX = (window.innerWidth - 400) / 2 - 40
      content.pageStatus.clientY = window.innerHeight / 3
      content.isShow = true
      content.$nextTick(function() {
        content.$broadcast('icon-hide', true)
        content.$broadcast('panel-hide', false)
      })
    } else {
      clearTimeout(tripleCtrlTimeout)
      tripleCtrlTimeout = setTimeout(function() {
        tripleCtrlCount = 0
      }, 500)
    }
  }
}

function setConfig(response) {
  Object.keys(response).forEach(function(k) {
    if (response[k] !== void(0)) {
      config[k] = response[k]
    }
  })
}

function isContainChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

function isContainEnglish(text) {
  return /[a-z,A-Z]/.test(text)
}

/* start-test-block */
module.exports = {
  mouseupEventHandler: mouseupEventHandler,
  setConfig: setConfig,
  config: config,
  pageStatus: pageStatus
}
/* end-test-block */
