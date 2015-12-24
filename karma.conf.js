'use strict'

var proxyquire = require('proxyquireify')
var partialify = require('partialify')

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify', 'sinon-chrome'],
    files: [
      'test/unit/**/*.js',
      'node_modules/jasmine-sinon/lib/jasmine-sinon.js'
    ],
    reporters: ['nyan', 'coverage'],
    'browserify': {
      'debug': true,
      // 'transform': [
      //   // 'browserify-shim',
      //   'browserify-istanbul'
      // ],
      configure: function(bundle) {
        bundle
          .transform(partialify)
          .transform('browserify-istanbul')
          .plugin(proxyquire.plugin)
          // .require(require.resolve('./test/unit/'), { entry: true })
      }
    },
    'coverageReporter': {
      'reporters': [{
        'type': 'lcov', 
        'dir': 'coverage',
        'subdir': '.'
      },{
        'type': 'text-summary'
      }]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // browsers: ['PhantomJS'],
    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      },
      PhantomJS_without_security: {
        base: 'PhantomJS',
        flags: ['--web-security=no']
      },
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--disable-web-security']
      }
    },
    singleRun: false
  })
}
