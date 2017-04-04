/**
 * @param {string} url
 * @returns {Document} dom element
 */
export default function fetchDom (url) {
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
