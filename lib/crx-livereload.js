// simple helper for chrome extension livereload
// http://blog.waymondo.com/2014-09-16-live-reloading-chrome-apps-and-extensions-with-gulp-and-websockets/

var socket

var reloadClient = {
  connect: function() {
    socket = new WebSocket('ws://localhost:9191')
    socket.onopen = function() {
      console.log('connected')
    }
    socket.onclose = function() {
      console.log('closed')
    }
    socket.onmessage = function(message) {
      if (message.data === 'reload') {
        return window.chrome.runtime.reload()
      }
    }
  },
  disconnect: function() {
    socket.close()
  }
}

reloadClient.connect()
