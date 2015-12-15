'use strict'

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()


/*
 * css
 */

var autoprefixer = require('autoprefixer')
var postcss = require('postcss')
var safeImportant = require('postcss-safe-important')


gulp.task('sass-debug', function () {
  ;['content', 'popup'].forEach(function(viewName) {
    gulp.src('./src/component/' + viewName + '/' + viewName + '.scss')
      // .pipe($.sassLint())
      // .pipe($.sassLint.format())
      // .pipe($.sassLint.failOnError())
      
      // .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss([
          autoprefixer({browsers: ['last 1 version']}),
          safeImportant()
        ]))
        // .pipe($.minifyCss())
      // .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/css/'))
      .pipe($.size({title: 'sass'}))
  })
})




/*
 * js
 */

var assign = require('lodash.assign')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var partialify = require('partialify')
var source = require('vinyl-source-stream')
var watchify = require('watchify')

gulp.task('js-lint', function() {
  gulp.src(['src/component/**/*.js', 'test/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
})

// generate js browserify tasks for apps
gulp.task('js-debug', function() {
  ;['popup', 'content', 'background'].forEach(function(appName) {
    // add custom browserify options here
    var customOpts = {
      entries: ['./src/component/' + appName + '/index.js'],
      debug: true
    }
    var opts = assign({}, watchify.args, customOpts)
    var b = watchify(browserify(opts)) 

    b.transform(partialify)

    // gulp.task('js-debug', bundle) // so you can run `gulp js` to build the file
    b.on('update', bundle) // on any dep update, runs the bundler
    b.on('log', $.util.log) // output build logs to terminal

    function bundle() {
      return b.bundle()
        .pipe(source(appName + '.js')) // 'app.js'
        .pipe($.buffer())
        .pipe($.stripCode({
          start_comment: 'start-test-block',
          end_comment: 'end-test-block'
        }))
        .pipe($.sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            // .pipe($.uglify())
            .on('error', $.util.log)
        .pipe($.sourcemaps.write('./')) // './'
        .pipe(gulp.dest('./dist/js/')) // './dist/js/'
        .pipe($.size({title: 'browserify ' + appName}))
    }

    bundle()
  })
})
