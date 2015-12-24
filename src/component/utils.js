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

// Simple Promise Chrome sendMessage Request
exports.sendMessage = function(msgObj) {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage(msgObj, function (response) {
      if (response && response.msg) {
        resolve(response)
      } else {
        reject(response)
      }
    })
  })
}


exports.isUndefined = function(e) {
  return typeof e === 'undefined'
}
