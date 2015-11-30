'use strict'

describe('content script test', function() {

  var proxyquire = require('proxyquireify')(require)

  var content
  var config
  var pageStatus
  var windowSelection

  beforeAll(function() {
    windowSelection =  window.getSelection

    chrome.runtime.sendMessage.callsArgWith(1, {
      msg: 'success',
      data: {
        grab: 'grabResult'
      }
    })

    content = proxyquire('../../../../src/component/content', {
      'vue': jasmine.createSpy('Vue'),
      './panel': jasmine.createSpy('panel'),
      './icon': jasmine.createSpy('icon')
    })

    config = content.config
    pageStatus = content.pageStatus
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
      pageStatus.userClicked = 'origin'
      pageStatus.selection = 'origin'
      pageStatus.clientX = 'origin'
      pageStatus.clientY = 'origin'
      content.mouseupEventHandler({
        target: {
          className: '',
          parentNode: {
            className: 'saladict otherClassName'
          }
        }
      })
      expect(pageStatus.userClicked).toBe('origin')
      expect(pageStatus.selection).toBe('origin')
      expect(pageStatus.clientX).toBe('origin')
      expect(pageStatus.clientY).toBe('origin')
    })

    it('click outside the saladict panel', function() {
      window.getSelection = function() {
        return 'selection'
      }
      pageStatus.userClicked = 'origin'
      pageStatus.selection = 'origin'
      pageStatus.clientX = 'origin'
      pageStatus.clientY = 'origin'
      content.mouseupEventHandler({
        target: {},
        clientY: 'Y',
        clientX: 'X'
      })
      expect(pageStatus.userClicked).toBe(true)
      expect(pageStatus.selection).toBe('selection')
      expect(pageStatus.clientX).toBe('X')
      expect(pageStatus.clientY).toBe('Y')
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
  })
})
