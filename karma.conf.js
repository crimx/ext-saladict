'use strict'

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      'test/unit/**/*.js',
    ],
    reporters: ['spec', 'coverage'],
    'browserify': {
      'debug': true,
      'transform': [
        // 'browserify-shim',
        'browserify-istanbul'
      ]
    },
    'coverageReporter': {
      'reporters': [
        {'type': 'html'},
        {'type': 'text-summary'}
      ]
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
      }
    },
    singleRun: true
  })
}
