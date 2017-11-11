import chsToChz from 'src/helpers/chs-to-chz'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  // https://github.com/audreyt/moedict-webkit#4-國語-a
  return fetch(`https://www.moedict.tw/a/${chsToChz(text)}.json`)
    .then(res => res.json())
    .then(data => {
      if (!data) { return Promise.reject('no result') }
      data.h.forEach(h => {
        if (h['=']) {
          h['='] = `https://203146b5091e8f0aafda-15d41c68795720c6e932125f5ace0c70.ssl.cf1.rackcdn.com/${h['=']}.ogg`
        }
      })
      return data
    })
}

