import fetchDom from 'src/helpers/fetch-dom'
const MP3URI = 'https://fs-gateway.eudic.net/store_main/sentencemp3/'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  let words = text.trim().split(/ +/)
  if (words.length > 2) {
    text = words.slice(0, 2).join(' ')
  }

  return fetchDom('https://dict.eudic.net/dicts/en/' + text)
    .then(handleDom)
}

/**
* @typedef {Object} EudicResult
* @property {string} cover
* @property {string} channel
* @property {string} mp3
* @property {string} en
* @property {string} chs
*/

/**
 * @async
 * @returns {Promise.<EudicResult>} A promise with the result to send back
 */
function handleDom (doc) {
  if (doc.querySelector('#TingLiju')) {
    return getResult(doc)
  }

  let status = doc.querySelector('#page-status')
  if (!status || !status.value) { return Promise.reject('no result') }

  let formData = new FormData()
  formData.append('status', status.value)

  return fetchDom('https://dict.eudic.net/Dicts/en/tab-detail/-12', {method: 'POST', body: formData})
    .then(getResult)
}

/**
 * @async
 * @returns {Promise.<EudicResult>} A promise with the result to send back
 */
function getResult (doc) {
  let result = []

  let items = doc.querySelectorAll('#lj_ting .lj_item')

  items.forEach(item => {
    let obj = {}

    let cover = item.querySelector('.channel img')
    if (cover) { obj.cover = cover.src }
    // if (cover) {
    //   let xhr = new XMLHttpRequest()
    //   xhr.open('GET', cover.src, false)
    //   xhr.responseType = 'blob'
    //   xhr.onload = function () {
    //     if (this.status === 200) {
    //       obj.cover = window.btoa(this.response)
    //     }
    //   }
    //   xhr.send()
    // }

    let channel = item.querySelector('.channel_title')
    if (channel) { obj.channel = channel.innerText }

    let audio = item.getAttribute('source')
    if (audio) { obj.mp3 = MP3URI + audio + '.mp3' }

    let en = item.querySelector('.line')
    if (en) { obj.en = en.innerText }

    let chs = item.querySelector('.exp')
    if (chs) { obj.chs = chs.innerText }

    if (Object.keys(obj).length > 0) {
      result.push(obj)
    }
  })

  if (result.length > 0) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
