'use strict'

if (process.env.NODE_ENV !== 'test') {
  window.browser = require('webextension-polyfill')
}
