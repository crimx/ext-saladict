'use strict'

var proxyquire = require('proxyquireify')(require)

// catch the addListener callback function
var msgListener
chrome.runtime.onMessage.addListener = function(fn) {
  msgListener = fn
}

// proxy dependencies
var bingEngine = jasmine.createSpy('bingEngine')
var server = proxyquire('../../../../src/js/background/entry', {
  './engines/bing' : bingEngine
})

describe('background server test', function() {

  var sendResponse = jasmine.createSpy('sendResponse')

  beforeEach(function() {
    sendResponse.calls.reset()
  })
  
  afterAll(function() {
    chrome.reset()
    chrome.flush()
  })

  it('request undefined directive', function() {
    msgListener({
      msg: 'undefined directive'
    }, 'sender', sendResponse)

    expect(sendResponse).toHaveBeenCalledWith({msg: null})
  })

  describe('notification test', function() {

    afterEach(function() {
      chrome.tabs.create.reset()
      chrome.storage.local.set.reset()
      chrome.storage.sync.set.reset()
      chrome.notifications.create.reset()
    })

    afterAll(function() {
      chrome.runtime.onInstalled.addListener.reset()
      chrome.notifications.onClicked.addListener.reset()
      chrome.runtime.onUpdateAvailable.addListener.reset()
    })

    it('create tab on click', function() {
      expect(chrome.notifications.onClicked.addListener).toHaveBeenCalled()
      chrome.notifications.onClicked.addListener.yield()
      expect(chrome.tabs.create).toHaveBeenCalled()
    })

    it('create notification on installed', function() {
      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled()

      var getMessage = chrome.i18n.getMessage
      // stub.returns won't work here(for-loop)
      var i = 3
      chrome.i18n.getMessage = function() {
        return i--
      }
      chrome.storage.local.set.callsArg(1)
      chrome.runtime.onInstalled.addListener.yield({reason: 'update'})

      expect(chrome.storage.local.set).toHaveBeenCalled()
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({appActive: true})
      expect(chrome.notifications.create).toHaveBeenCalled()

      chrome.i18n.getMessage = getMessage
    })

    it('faild create notification on installed', function() {
      chrome.runtime.onInstalled.addListener.yield({reason: 'Wrong Reason'})
      expect(chrome.storage.local.set).not.toHaveBeenCalled()
      expect(chrome.storage.sync.set).not.toHaveBeenCalled()
      expect(chrome.notifications.create).not.toHaveBeenCalled()
    })

    it('create notification on update available', function() {
      expect(chrome.runtime.onUpdateAvailable.addListener).toHaveBeenCalled()

      chrome.runtime.onUpdateAvailable.addListener.yield()

      expect(chrome.notifications.create).toHaveBeenCalled()
    })
  })

  describe('trigger translate', function() {

    it ('with message', function() {
      var text = 'word'

      msgListener({
        msg: 'translate',
        id: 'bing',
        text: text
      }, 'sender', sendResponse)

      expect(bingEngine).toHaveBeenCalledWith(text, sendResponse)
    })

    it ('null message', function() {

      msgListener({
        msg: 'translate'
      }, 'sender', sendResponse)

      expect(bingEngine).toHaveBeenCalledWith(null, sendResponse)
    })
  })


  describe('trigger grab', function() {

    var msg = {aMsg: 'success'}

    afterAll(function() {
      chrome.storage.local.get.reset()
      chrome.storage.sync.get.reset()
    })

    it ('get result from local storage', function() {
      chrome.storage.local.get.callsArgWith(1, msg)
      chrome.storage.sync.get.callsArgWith(1, {})

      msgListener({
        msg: 'grab'
      }, 'sender', sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        msg: 'success',
        data: msg
      })
    })

    it ('get result from sync storage', function() {

      chrome.storage.local.get.callsArgWith(1, {})
      chrome.storage.sync.get.callsArgWith(1, msg)

      msgListener({
        msg: 'grab'
      }, 'sender', sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        msg: 'success',
        data: msg
      })
    })

    it ('no result', function() {

      chrome.storage.local.get.callsArgWith(1, {})
      chrome.storage.sync.get.callsArgWith(1, {})

      msgListener({
        msg: 'grab'
      }, 'sender', sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({msg: null})
    })
  })

  describe('trigger newTab', function() {
    
    beforeEach(function() {
      chrome.tabs.create.callsArg(1)
    })

    afterEach(function() {
      chrome.tabs.create.reset()
    })

    it('open new tab', function() {

      msgListener({
        msg: 'newTab',
        url: 'a url'
      }, 'sender', sendResponse)

      expect(chrome.tabs.create).toHaveBeenCalled()
      expect(sendResponse).toHaveBeenCalledWith({msg: 'success'})
    })

    it('faild open new tab', function() {

      msgListener({
        msg: 'newTab'
      }, 'sender', sendResponse)

      expect(chrome.tabs.create).not.toHaveBeenCalled()
      expect(sendResponse).toHaveBeenCalledWith({msg: null})
    })
  })


  describe('trigger save', function() {

    beforeAll(function() {
      chrome.storage.local.set.callsArg(1)
    })

    afterEach(function() {
      chrome.storage.local.set.reset()
      chrome.storage.sync.set.reset()
      chrome.runtime.sendMessage.reset()
    })

    it('save correctly', function() {

      var items = {a: 'a'}
      msgListener({
        msg: 'save',
        items: items
      }, 'sender', sendResponse)

      expect(chrome.storage.local.set).toHaveBeenCalled()
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(items)
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        msg: 'appStateChanged',
        items: Object.keys(items)
      })
      expect(sendResponse).toHaveBeenCalledWith({msg: 'success'})
    })

    it('save with no items', function() {

      msgListener({msg: 'save'}, 'sender', sendResponse)

      expect(chrome.storage.local.set).not.toHaveBeenCalled()
      expect(chrome.storage.sync.set).not.toHaveBeenCalled()
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled()
      expect(sendResponse).toHaveBeenCalledWith({msg: null})
    })
  })
})
