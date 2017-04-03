import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    fetchDom('https://www.vocabulary.com/dictionary/' + text)
      .then(handleDom, reject)
      .then(resolve, reject)
      .catch(reject)

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
        return Promise.resolve(result)
      } else {
        return Promise.reject('no result')
      }
    }
  })
}
