'use strict'

var assign = require('lodash.assign')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var del = require('del')
var gulp = require('gulp')
var gulpLoadPlugins = require('gulp-load-plugins')
var runSequence = require('run-sequence')
var Server = require('karma').Server
var source = require('vinyl-source-stream')
var watchify = require('watchify')

var $ = gulpLoadPlugins()
var pkg = require('./package.json')

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n')



// Clean output directory
gulp.task('clean', function() {
  del(['dist/*'], {dot: true})
})

// copy everything except js files
gulp.task('copy', function() {
  gulp.src([
    'src/**/*',
    '!src/js/**/*',
    '!src/manifest.json'
  ], {
    dot: true
  }).pipe($.changed('dist'))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
})

// pass manifest.json
gulp.task('manifest', function() {
  gulp.src('src/manifest.json', {dot: true})
    .pipe($.jsonEditor({
      version: pkg.version,
      background: {
        persistent: true
      }
    }))
    .pipe(gulp.dest('dist'))
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
  gulp.watch(['src/**/*', '!src/js/**/*', '!src/manifest.json'], ['copy'])
  gulp.watch(['src/manifest.json'], ['manifest'])
});

gulp.task('default', function() {
  runSequence(
    'clean',
    ['copy',
      'manifest',
      'js-popup',
      'js-content',
      'js-background'],
    'watch'
  )
})

// test popup script
gulp.task('test-popup', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
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
    configFile: __dirname + '/karma.conf.js',
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
    configFile: __dirname + '/karma.conf.js',
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

gulp.task('travis', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    'preprocessors': {
      'test/unit/**/*spec.js': ['browserify']
    },
    reporters: ['spec', 'coverage', 'coveralls'],
    browsers: ['Chrome_travis_ci'],
    singleRun: true
  }, done).start()
})
