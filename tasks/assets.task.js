'use strict'

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()


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
gulp.task('manifest-debug', function() {
  gulp.src('lib/crx-livereload.js', {dot: true})
    .pipe(gulp.dest('dist'))

  return gulp.src('src/manifest.json', {dot: true})
    .pipe($.jsonEditor({
      background: {
        scripts: [
          'js/background.js',
          'crx-livereload.js'
        ],
        persistent: true
      }
    }))
    .pipe(gulp.dest('dist'))
})


// extension live reload
var WebSocketServer = require('ws').Server
var wss
gulp.task('createWebSocketServer', function() {
  wss = new WebSocketServer({port: 9191})
})

gulp.task('livereload', function() {
  if (wss) {
    setTimeout(function() {
      wss.clients.forEach(function(client) {
        client.send('reload')
      })
    }, 500)
  }
})
