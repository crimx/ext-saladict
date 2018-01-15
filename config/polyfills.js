'use strict'

if (process.env.NODE_ENV === 'test') {
  window.browser = require('sinon-chrome/webextensions')
  // In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
  // We don't polyfill it in the browser--this is user's responsibility.
  require('raf').polyfill(global)
} else {
  window.browser = require('webextension-polyfill')
}
