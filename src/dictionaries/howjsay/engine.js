import fetchDom from 'src/helpers/fetch-dom'
const MP3URI = 'http://www.howjsay.com/mp3/'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  const options = config.dicts.all.howjsay.options

  let words = text.trim().split(/ +/)
  if (words.length > 2) {
    text = words.slice(0, 2).join(' ')
  }

  return fetchDom('http://www.howjsay.com/index.php?word=' + text)
    .then(doc => handleDom(doc, text, options))
}

/**
* @typedef {Object} HowjsayWord
* @property {string} title
* @property {string} mp3 - mp3 link
*/

/**
* @typedef {Object} HowjsayResult
* @property {HowjsayWord} currentWord
* @property {HowjsayWord[]} relatedWords
*/

/**
 * @async
 * @returns {Promise.<HowjsayResult>} A promise with the result to send back
 */
function handleDom (doc, text, options) {
  let result = {
    currentWord: {
      title: text,
      mp3: ''
    }
  }

  let currentWord = doc.querySelector('#currentWord')
  if (currentWord && currentWord.value) {
    result.currentWord.title = currentWord.value
    result.currentWord.mp3 = MP3URI + currentWord.value + '.mp3'
  }

  if (options.related) {
    let relatedWordChecker = /pronunciation-of/
    result.relatedWords = Array.from(doc.querySelectorAll('.subtitle'))
      .filter(el => relatedWordChecker.test(el.innerHTML))
      .map(el => ({
        title: el.innerText,
        mp3: MP3URI + el.innerText + '.mp3'
      }))
  }

  if (result.currentWord.mp3) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
