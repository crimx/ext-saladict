import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    const options = config.dicts.all.howjsay.options
    const MP3URI = 'http://www.howjsay.com/mp3/'

    let words = text.trim().split(/ +/)
    if (words.length > 2) {
      text = words.slice(0, 2).join(' ')
    }

    fetchDom('http://www.howjsay.com/index.php?word=' + text)
      .then(handleDom, reject)
      .then(resolve, reject)
      .catch(reject)

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
    function handleDom (doc) {
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
        return Promise.resolve(result)
      } else {
        return Promise.reject('no result')
      }
    }
  })
}
