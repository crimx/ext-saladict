import fetchDom from 'src/helpers/fetch-dom'
import stripScript from 'src/helpers/strip-script'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  return fetchDom('http://www.iciba.com/' + text)
    .then(handleDom)
}

/**
* @typedef {Object} CobuildResult
* @property {string} title
* @property {string} level
* @property {number} star
* @property {Object[]} prons
* @property {string} prons[].phsym
* @property {string} prons[].audio
* @property {string[]} defs
*/

/**
 * @returns {Promise.<CobuildResult>} A promise with the result to send back
 */
function handleDom (doc) {
  let result = {}

  let $title = doc.querySelector('.keyword')
  if ($title) { result.title = $title.innerText.trim() }

  let $level = doc.querySelector('.base-level')
  if ($level) { result.level = $level.innerText.trim() }

  let $star = doc.querySelector('.word-rate [class^="star"]')
  if ($star) {
    let star = Number($star.className[$star.className.length - 1])
    if (!isNaN(star)) { result.star = star }
  }

  let $pron = doc.querySelector('.base-speak')
  if ($pron) {
    result.prons = Array.from($pron.children).map(el => ({
      phsym: el.innerText.trim(),
      audio: (/http\S+.mp3/.exec(el.innerText) || [''])[0]
    }))
  }

  let $article = Array.from(doc.querySelectorAll('.info-article')).find(x => /柯林斯高阶英汉双解学习词典/.test(x.innerText))
  if ($article) {
    result.defs = Array.from($article.querySelectorAll('.prep-order'))
      .map(x => stripScript(x).innerHTML)
  }

  if (Object.keys(result).length > 0) {
    return result
  }
  return Promise.reject('no result')
}
