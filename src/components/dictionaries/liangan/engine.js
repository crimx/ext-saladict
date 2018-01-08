import chsToChz from 'src/helpers/chs-to-chz'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @param {object} helpers - helper functions
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  // https://github.com/audreyt/moedict-webkit#7-兩岸詞典-c
  return fetch(`https://www.moedict.tw/c/${chsToChz(text)}.json`)
    .then(res => res.json())
    .then(data => {
      if (!data) { return Promise.reject('no result') }
      data.h.forEach(h => {
        if (h.p) {
          h.p = h.p.replace('<br>陸⃝', ' [大陆]: ')
        }
      })
      return data
    })
}
