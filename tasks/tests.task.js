'use strict'

var gulp = require('gulp')
var Server = require('karma').Server
var $ = require('gulp-load-plugins')()

// test popup script
gulp.task('test-popup', function (done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    exclude: [
      'test/unit/specs/background/**/*',
      'test/unit/specs/content/**/*'
    ],
    'preprocessors': {
      'test/unit/specs/popup/**/*spec.js': ['browserify'],
      'test/unit/specs/*spec.js': ['browserify']
    },
    browsers: ['Chrome']
  }, done).start()
})


// test content script
gulp.task('test-content', function (done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    exclude: [
      'test/unit/specs/background/**/*',
      'test/unit/specs/popup/**/*'
    ],
    'preprocessors': {
      'test/unit/specs/content/**/*spec.js': ['browserify'],
      'test/unit/specs/*spec.js': ['browserify']
    },
    browsers: ['Chrome']
  }, done).start()
})


// test background script, disable web security for cross domain xhr
gulp.task('test-background', function (done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    exclude: [
      'test/unit/specs/content/**/*',
      'test/unit/specs/popup/**/*'
    ],
    'preprocessors': {
      'test/unit/specs/background/**/*spec.js': ['browserify'],
      'test/unit/specs/*spec.js': ['browserify']
    },
    browsers: ['Chrome_without_security']
  }, done).start()
})


// for travis CI
gulp.task('travis', function(done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    'preprocessors': {
      'test/unit/**/*spec.js': ['browserify']
    },
    reporters: ['spec', 'coverage', 'coveralls'],
    browsers: ['Chrome_travis_ci'],
    singleRun: true
  }, done).start()
})
