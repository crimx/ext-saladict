'use strict'

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var pkg = require('../package.json')

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n')


gulp.task('release', function() {
  // TODO
  // .pipe($.header(banner, {pkg: pkg}))

  // manifest.json
})
