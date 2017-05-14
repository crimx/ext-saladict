/**
 * @param {string} url
 * @returns {Document} dom element
 */
export default function fetchDom (url, options) {
  if (typeof url !== 'string') {
    throw new TypeError('argument 1 has to be string')
  }

  if (options && /^post$/i.test(options.method)) {
    return postHandler(url, options.body)
  }

  return getHandler(url)
}

function getHandler (url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = function () {
      if (xhr.status !== 200) {
        return reject('Response code ' + xhr.status)
      }
      resolve(xhr.responseXML)
    }
    xhr.onerror = function (e) {
      reject(e.toString())
    }
    xhr.open('GET', url)
    xhr.responseType = 'document'
    xhr.send()
  })
}

function postHandler (url, body) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = function () {
      if (xhr.status !== 200) {
        return reject('Response code ' + xhr.status)
      }
      resolve(xhr.responseXML)
    }
    xhr.onerror = function (e) {
      reject(e.toString())
    }
    xhr.open('POST', url)
    xhr.responseType = 'document'
    body ? xhr.send(body) : xhr.send()
  })
}
