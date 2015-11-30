'use strict'

var proxyquire = require('proxyquireify')(require)


chrome.runtime.sendMessage.callsArgWith(1, {
  msg: 'success',
  data: {
    grab: 'grabResult'
  }
})


// proxy dependencies
var Vue = jasmine.createSpy('Vue')
var panel = jasmine.createSpy('panel')
var icon = jasmine.createSpy('icon')
var content = proxyquire('../../../../src/component/content', {
  'vue': Vue,
  './panel': panel,
  './icon': icon
})


describe('content script test', function() {

  var config = content.config

  var windowSelection
  beforeAll(function() {
    windowSelection =  window.getSelection
  })

  afterAll(function() {
    chrome.reset()
    chrome.flush()
    window.getSelection = windowSelection
  })

  it('set config', function() {
    config.a = 'a'
    config.b = 'b'
    config.c = 'c'

    content.setConfig({
      a: 'aa',
      b: 'b',
      c: void(0)
    })

    expect(config.a).toEqual('aa')
    expect(config.b).toEqual('b')
    expect(config.c).toEqual('c')
  })

  describe('mouse event handler', function() {

    it('click inside the saladict panel', function() {
      config.userClicked = 'origin'
      config.selection = 'origin'
      config.clientX = 'origin'
      config.clientY = 'origin'
      content.mouseupEventHandler({
        target: {
          id: '',
          parentNode: {
            id: 'saladict-panel'
          }
        }
      })
      expect(config.userClicked).toBe('origin')
      expect(config.selection).toBe('origin')
      expect(config.clientX).toBe('origin')
      expect(config.clientY).toBe('origin')
    })

    it('click outside the saladict panel', function() {
      window.getSelection = function() {
        return 'selection'
      }
      config.userClicked = 'origin'
      config.selection = 'origin'
      config.clientX = 'origin'
      config.clientY = 'origin'
      content.mouseupEventHandler({
        target: {},
        clientY: 'Y',
        clientX: 'X'
      })
      expect(config.userClicked).toBe(true)
      expect(config.selection).toBe('selection')
      expect(config.clientX).toBe('X')
      expect(config.clientY).toBe('Y')
    })
  })

  describe('background', function() {

    it('app state changed message', function() {
      chrome.runtime.onMessage.addListener.yield({
        msg: 'somethingelse',
        data: {
          state: 'some thing else'
        }
      })
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled()
      expect(config.state).toEqual(void(0))

      chrome.runtime.onMessage.addListener.yield({
        msg: 'appStateChanged',
        data: {
          state: 'appStateChangedResult'
        }
      })
      expect(config.state).toEqual('appStateChangedResult')
    })

    it('grab message', function() {
      expect(chrome.runtime.sendMessage).toHaveBeenCalled()
      expect(config.grab).toEqual('grabResult')
    })
  })
})
