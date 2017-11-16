import fetchDom from 'src/helpers/fetch-dom'
import stripScript from 'src/helpers/strip-script'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  return fetchDom('http://www.ldoceonline.com/dictionary/' + text.replace(/[^A-Za-z0-9]+/g, '-'))
    .then(handleDom)
    .then(null, () => trySuggestion(text))
}

/**
 * @async
 * @returns {Promise.<string>} A promise with the result to send back
 */
function handleDom (doc) {
  let $entry = doc.querySelector('.bussdictEntry')
  if (!$entry) { return Promise.reject('no result') }
  return stripScript($entry).innerHTML
}

/**
 * Get suggestions and try the first one
 * @async
 * @returns {Promise.<BusinessResult>} A promise with the result to send back
 */
function trySuggestion (text) {
  return fetchDom('http://www.ldoceonline.com/search/?q=' + text)
    .then(doc => {
      let li = doc.querySelector('.searches li')
      if (li && li.innerText) {
        return fetchDom('http://www.ldoceonline.com/dictionary/' + li.innerText)
          .then(doc => handleDom(doc))
      }
      return Promise.reject('no result')
    })
}
