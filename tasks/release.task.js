'use strict'

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var runSequence = require('run-sequence')
var pkg = require('../package.json')

var banner = ['/*!',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n')


gulp.task('release', function() {
  runSequence(
    'clean',
    'copy',
    ['manifest', 'sass', 'js']
  )
})

// Clean dist directory
var del = require('del')
gulp.task('clean', function() {
  return del(['dist/*'])
})


// copy everything except script files
gulp.task('copy', function() {
  gulp.src('src/component/popup/popup.html', {
    base: 'src/component/popup'
  }).pipe(gulp.dest('dist/html'))

  return gulp.src([
    'src/images/**/*',
    'src/_locales/**/*'
  ], {
    base: 'src'
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
})


// parse manifest.json
gulp.task('manifest', function() {
  return gulp.src('src/manifest.json', {dot: true})
    .pipe($.jsonEditor({
      version: pkg.version
    }))
    .pipe(gulp.dest('dist'))
})


/*
 * css
 */

var autoprefixer = require('autoprefixer')
var postcss = require('postcss')
var safeImportant = require('postcss-safe-important')

gulp.task('sass', function () {
  gulp.src('./src/component/content/content.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: ['last 1 version']}),
      safeImportant()
    ]))
    .pipe($.minifyCss())
    .pipe($.header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./dist/css/'))
    .pipe($.size({title: 'content sass'}))

  return gulp.src('./src/component/popup/popup.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: ['last 1 version']})
    ]))
    .pipe($.minifyCss())
    .pipe($.header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./dist/css/'))
    .pipe($.size({title: 'popup sass'}))
})




/*
 * js
 */

var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var partialify = require('partialify')
var source = require('vinyl-source-stream')

gulp.task('js', function() {
  ;['popup', 'content', 'background'].forEach(function(appName) {
    // set up the browserify instance on a task basis
    var b = browserify({
      entries: './src/component/' + appName + '/index.js',
      debug: false,
      transform: [partialify]
    })

    return b.bundle()
      .pipe(source(appName + '.js'))
      .pipe($.buffer())
      .pipe($.stripCode({
        start_comment: 'start-test-block',
        end_comment: 'end-test-block'
      }))
      .pipe($.stripCode({
        start_comment: 'start-debug-block',
        end_comment: 'end-debug-block'
      }))
      .pipe($.uglify())
      .pipe($.header(banner, {pkg: pkg}))
      .pipe(gulp.dest('./dist/js/'))
      .pipe($.size({title: 'browserify ' + appName}))
  })
})
