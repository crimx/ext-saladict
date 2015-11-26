'use strict'

var utils = require('../../../src/js/utils')
require('jasmine-ajax')

describe('background utils test', function() {

  var resolve, reject

  beforeAll(function() {
    jasmine.Ajax.install()
    jasmine.Ajax.stubRequest('/success').andReturn({
      status: 200,
      contentType: 'text/plain',
      responseText: 'immediate response'
    })
    jasmine.Ajax.stubRequest('/faild').andReturn({
      status: 404
    })
    jasmine.Ajax.stubRequest('/error').andError()
  })

  afterAll(function() {
    jasmine.Ajax.uninstall()
  })

  describe('utils.get test', function() {
    
    beforeEach(function(done) {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
      utils.get('/success')
        .then(resolve, reject)
        .then(done)
    })

    it('request success', function() {
      expect(resolve).toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    })
  })

  describe('utils.get test', function() {
    
    beforeEach(function(done) {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
      utils.get('/faild')
        .then(resolve, reject)
        .then(done)
    })

    it('request /faild', function() {
      expect(resolve).not.toHaveBeenCalled()
      expect(reject).toHaveBeenCalled()
    })
  })

  describe('utils.get test', function() {
    
    beforeEach(function(done) {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
      utils.get('/error')
        .then(resolve, reject)
        .then(done)
    })

    it('request /error', function() {
      expect(resolve).not.toHaveBeenCalled()
      expect(reject).toHaveBeenCalled()
    })
  })

  describe('utils.sendMessage test', function() {
    var resolve, reject
    var sendMessage = chrome.runtime.sendMessage

    beforeEach(function(done) {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
      chrome.runtime.sendMessage = function(msg, cb) {
        setTimeout(function() {
          cb(msg)
        }, 500)
      }

      utils.sendMessage({msg: 'msg'})
        .then(resolve, reject)
        .then(done)
    })

    afterEach(function() {
      chrome.runtime.sendMessage = sendMessage
    })

    it('should invoke resolve', function() {
      expect(resolve).toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    })
  })

  describe('utils.sendMessage test', function() {
    var resolve, reject
    var sendMessage = chrome.runtime.sendMessage

    beforeEach(function(done) {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
      chrome.runtime.sendMessage = function(msg, cb) {
        setTimeout(function() {
          cb(msg)
        }, 500)
      }

      utils.sendMessage({})
        .then(resolve, reject)
        .then(done)
    })

    afterEach(function() {
      chrome.runtime.sendMessage = sendMessage
    })

    it('should invoke resolve', function() {
      expect(resolve).not.toHaveBeenCalled()
      expect(reject).toHaveBeenCalled()
    })
  })
})
