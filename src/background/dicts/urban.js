import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    const options = config.dicts.all.urban.options

    fetchDom('http://www.urbandictionary.com/define.php?term=' + text)
      .then(handleDom, reject)
      .then(resolve, reject)
      .catch(reject)

    /**
    * @typedef {Object} UrbanResult
    * @property {string} title - keyword
    * @property {string} pron - pronunciation
    * @property {string} meaning
    * @property {string} example
    * @property {string[]} tags
    * @property {string} contributor - who write this explanation
    * @property {string} thumbsUp - numbers of thumbs up
    * @property {string} thumbsDwon - numbers of thumbs down
    */

    /**
     * @async
     * @returns {Promise.<UrbanResult[]>} A promise with the result to send back
     */
    function handleDom (doc) {
      let result = []
      let defPanels = Array.from(doc.querySelectorAll('.def-panel'))

      if (defPanels.length <= 0) {
        return Promise.reject('no result')
      }

      defPanels.every($panel => {
        if (result.length >= options.resultnum) { return false }

        let resultItem = {}

        let $title = $panel.querySelector('.word')
        if ($title) {
          resultItem.title = $title.innerText
        }

        let $pron = $panel.querySelector('.play-sound')
        if ($pron) {
          resultItem.pron = JSON.parse($pron.dataset.urls)[0]
        }

        let $meaning = $panel.querySelector('.meaning')
        if ($meaning) {
          resultItem.meaning = $meaning.innerText
          if (/There aren't any definitions for/i.test(resultItem.meaning)) {
            return true
          }
        }

        let $example = $panel.querySelector('.example')
        if ($example) {
          resultItem.example = $example.innerText
        }

        let $tags = Array.from($panel.querySelectorAll('.tags a'))
        if ($tags && $tags.length > 0) {
          resultItem.tags = $tags.map($tag => $tag.innerText.slice(1))
        }

        let $contributor = $panel.querySelector('.contributor')
        if ($contributor) {
          resultItem.contributor = $contributor.innerText
        }

        let $thumbsUp = $panel.querySelector('.thumbs .up .count')
        if ($thumbsUp) {
          resultItem.thumbsUp = $thumbsUp.innerText
        }

        let $thumbsDown = $panel.querySelector('.thumbs .down .count')
        if ($thumbsDown) {
          resultItem.thumbsDown = $thumbsDown.innerText
        }

        if (Object.keys(resultItem).length > 0) {
          result.push(resultItem)
        }

        return true
      })

      if (result.length > 0) {
        return Promise.resolve(result)
      } else {
        return Promise.reject('no result')
      }
    }
  })
}
