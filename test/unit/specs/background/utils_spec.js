'use strict'

var utils = require('../../../../src/js/background/utils.js')
require('jasmine-ajax')

describe('background utils test', function() {

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
  })

  afterAll(function() {
    jasmine.Ajax.uninstall()
  })

  describe('utils.get test', function() {
    var resolve, reject

    beforeEach(function() {
      resolve = jasmine.createSpy('resolve')
      reject = jasmine.createSpy('reject')
    })

    it('should invoke resolve callback(request /success)', function(done) {
      utils.get('/success')
        .then(resolve, reject)
        .then(function() {
          expect(resolve).toHaveBeenCalled()
          expect(reject).not.toHaveBeenCalled()
        })
        .then(done)
    })

    it('should invoke reject  callback(request /faild)', function(done) {
      utils.get('/faild')
        .then(resolve, reject)
        .then(function() {
          expect(resolve).not.toHaveBeenCalled()
          expect(reject).toHaveBeenCalled()
        })
        .then(done)
    })
  })
})
