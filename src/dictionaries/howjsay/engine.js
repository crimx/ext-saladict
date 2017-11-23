import fetchDom from 'src/helpers/fetch-dom'
const MP3URI = 'http://www.howjsay.com/mp3/'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @param {object} helpers - helper functions
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config, {AUDIO}) {
  const options = config.dicts.all.howjsay.options

  let words = text.trim().split(/ +/)
  if (words.length > 2) {
    text = words.slice(0, 2).join(' ')
  }

  return fetchDom('http://www.howjsay.com/index.php?word=' + text)
    .then(doc => handleDom(doc, text, options))
    .then(result => {
      if (config.autopron.en.dict === 'howjsay') {
        setTimeout(() => {
          AUDIO.play(result.currentWord.mp3)
        }, 0)
      }
      return result
    })
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
    result.relatedWords = Array.from(doc.querySelectorAll('.linksres'))
      .map(el => {
        const title = el.innerText.trim()
        return {
          title,
          mp3: MP3URI + title + '.mp3'
        }
      })
  }

  if (result.currentWord.mp3) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
