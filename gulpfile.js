'use strict'


var gulp = require('gulp')
var runSequence = require('run-sequence')
var $ = require('gulp-load-plugins')()

require('require-dir')('./tasks')


gulp.task('watch', function() {
  gulp.watch(['src/js/**/*.js', 'test/**/*.js'], ['js-lint'])
  gulp.watch(['src/sass/**/*.scss'], ['sass-debug'])
  gulp.watch(['src/manifest.json'], ['manifest-debug'])
  gulp.watch(['src/**/*'], ['livereload'])
  gulp.watch([
    'src/**/*',
    '!src/js/**/*',
    '!src/manifest.json',
    '!src/sass/**/*'
  ], ['copy'])
});


gulp.task('default', function() {
  runSequence(
    'clean',
    'copy',
    ['manifest-debug',
      'sass-debug',
      'js-popup-debug',
      'js-content-debug',
      'js-background-debug',
      'createWebSocketServer'],
    'watch'
  )
})
