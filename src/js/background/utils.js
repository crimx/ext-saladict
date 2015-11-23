'use strict'

// Simple Promise GET XMLHttpRequest
exports.get = function (url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.responseText)
      } else {
        reject(Error(xhr.statusText))
      }
    }
    xhr.onerror = function () {
      reject(Error('Network Error'))
    }
    xhr.send()
  })
}
