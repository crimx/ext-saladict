'use strict'

var chrome = require('sinon-chrome')
var gb = global || window

beforeAll(function() {

  // make mock chrome global
  gb.chrome = chrome

  chrome.runtime.id = 'SALADICT_TEST_ID'

  // stub i18n messages
  var zhLocale = require('../../src/_locales/zh_CN/messages.json')

  for (var n in zhLocale) {
    if (zhLocale.hasOwnProperty(n)) {
      chrome.i18n.getMessage.withArgs(n).returns(zhLocale[n].message)
    }
  }

})
