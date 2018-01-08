import fetchDom from 'src/helpers/fetch-dom'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @param {object} helpers - helper functions
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  return fetchDom('https://www.vocabulary.com/dictionary/' + text)
    .then(handleDom)
}

/**
* @typedef {Object} VocabularyResult
* @property {string} short
* @property {string} long
*/

/**
 * @async
 * @returns {Promise.<VocabularyResult>} A promise with the result to send back
 */
function handleDom (doc) {
  let result = {}

  let $short = doc.querySelector('.short')
  if ($short) {
    result.short = $short.innerText
  }

  let $long = doc.querySelector('.long')
  if ($long) {
    result.long = $long.innerText
  }

  if (Object.keys(result).length > 0) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
