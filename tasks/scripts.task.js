'use strict'

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()


/*
 * css
 */

var autoprefixer = require('autoprefixer')
var postcss = require('postcss')

// tiny postcss plugin for appending important to each declaration
var addImportant = postcss.plugin('postcss-addImportant',
  function(options) {
    options = options || {}
    return function(css) {
      css.walkDecls(function(d) {
        d.important = true
      })
    }
  })

gulp.task('sass-debug', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe($.sassLint())
    .pipe($.sassLint.format())
    .pipe($.sassLint.failOnError())
    .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.postcss([
        autoprefixer({browsers: ['last 1 version']}),
        addImportant
      ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css/'))
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
  gulp.src(['src/js/**/*.js', 'test/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
})

// generate js browserify tasks for apps
var browserifyTaskGen = function(appNames, dependencies) {
  appNames.forEach(function(appName) {
    // add custom browserify options here
    var customOpts = {
      entries: ['./src/js/' + appName + '/entry.js'],
      debug: true
    }
    var opts = assign({}, watchify.args, customOpts)
    var b = watchify(browserify(opts)) 

    b.transform(partialify)

    // so you can run `gulp js-name-debug` to build the file
    gulp.task('js-' + appName + '-debug', dependencies, bundle)
    b.on('update', bundle) // on any dep update, runs the bundler
    b.on('log', $.util.log) // output build logs to terminal

    function bundle() {
      return b.bundle()
        .pipe(source(appName + '.js')) // 'app.js'
        .pipe($.buffer())
        .pipe($.sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            .pipe($.uglify())
            .on('error', $.util.log)
        .pipe($.sourcemaps.write('./')) // './'
        .pipe(gulp.dest('./dist/js/')) // './dist/js/'
    }
  })

}
browserifyTaskGen(['popup', 'content', 'background'], ['js-lint'])
