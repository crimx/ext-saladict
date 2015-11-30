'use strict'

var utils = require('../utils')
var Vue = require('vue')

// default config
var config = {
  appActive: true,
  userClicked: false,

  iconMode: true,
  ctrlMode: false, // TODO
  directMode: false, // TODO

  chineseMode: true,
  englishMode: true,

  clientX: 0,
  clientY: 0,
  selection: ''
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

// panel component
var injectPanel  = document.createElement('div')
injectPanel.id = 'saladict-panel'
var panelTemplate = require('./panel')
panelTemplate.data.config = config

// icon component
var injectIcon  = document.createElement('div')
injectIcon.id = 'saladict-icon'
var iconTemplate = require('./icon')
iconTemplate.data.config = config

// inject vue
document.body.insertBefore(injectPanel, document.body.firstChild)
document.body.insertBefore(injectIcon, document.body.firstChild)
var panel = new Vue(panelTemplate)
var icon = new Vue(iconTemplate)


// listen to click
document.body.addEventListener('mouseup', mouseupEventHandler)

function mouseupEventHandler(evt) {
  var el = evt.target

  // check if inside the panel
  do {
    if (el.id === 'saladict-panel') {
      return
    }
    el = el.parentNode
  } while (el)

  config.userClicked = true
  config.selection = window.getSelection().toString()
  config.clientX = evt.clientX
  config.clientY = evt.clientY
}

function setConfig(response) {
  Object.keys(response).forEach(function(k) {
    if (response[k] !== void(0)) {
      config[k] = response[k]
    }
  })
}

/* start-test-block */
module.exports = {
  mouseupEventHandler: mouseupEventHandler,
  setConfig: setConfig,
  config: config
}
/* end-test-block */
