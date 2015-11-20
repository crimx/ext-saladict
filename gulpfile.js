'use strict'

var assign = require('lodash.assign')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var del = require('del')
var gulp = require('gulp')
var gulpLoadPlugins = require('gulp-load-plugins')
var source = require('vinyl-source-stream')
var watchify = require('watchify')

var $ = gulpLoadPlugins()

// Clean output directory
gulp.task('clean', function() {
  del(['dist/*'], {dot: true})
})

// copy everything except js files
gulp.task('copy', function() {
  gulp.src([
    'src/**/*',
    '!src/js/**/*'
  ], {
    dot: true
  }).pipe($.changed('dist'))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
})

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

    // add transformations here
    // i.e. b.transform(coffeeify)

    gulp.task('js-' + appName, dependencies, bundle) // so you can run `gulp js` to build the file
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

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch(['src/js/**/*.js', 'test/**/*.js'], ['js-lint'])
  gulp.watch(['src/**/*', '!src/js/**/*'], ['copy'])
});

gulp.task('default', [
  'clean',
  'copy',
  'js-popup',
  'js-content',
  'js-background',
  'watch'
  ])