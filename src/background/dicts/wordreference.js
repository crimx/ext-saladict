import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    const options = config.dicts.all.wordreference.options

    fetchDom('http://www.wordreference.com/definition/' + text)
      .then(handleDom, reject)
      .then(resolve, reject)
      .catch(reject)

    /**
    * @typedef {Object} WordReferenceResult
    * @property {string} etym
    * @property {string[]} idioms
    */

    /**
     * @async
     * @returns {Promise.<WordReferenceResult>} A promise with the result to send back
     */
    function handleDom (doc) {
      let result = {}

      if (options.idiom) {
        let $idioms = Array.from(doc.querySelectorAll('.rh_idib li'))
        if ($idioms.length > 0) {
          result.idioms = $idioms.map(el => el.innerText)
        }
      }

      if (options.etym) {
        let $etym = doc.querySelector('.etyUl')
        if ($etym) {
          result.etym = $etym.innerText
        }
      }

      if (Object.keys(result).length > 0) {
        return Promise.resolve(result)
      } else {
        return Promise.reject('no result')
      }
    }
  })
}
