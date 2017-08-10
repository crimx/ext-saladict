import fetchDom from 'src/helpers/fetch-dom'
import {reflect} from 'src/helpers/promise-more'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  return fetchDom('http://www.macmillandictionary.com/dictionary/british/' + text.replace(/[^A-Za-z0-9]+/g, '-'))
    .then(checkResult)
    .then(addRelated)
    .then(handleAllDom)
}

function checkResult (doc) {
  if (doc.querySelector('.senses .SENSE')) {
    return doc
  } else {
    let alternative = doc.querySelector('#search-results li a')
    if (alternative) {
      return fetchDom(alternative.href)
    }
  }
  return Promise.reject('no result')
}

function addRelated (doc) {
  let $link = doc.querySelector('[rel="canonical"]')
  if (!$link) { return [doc] }

  let keyword = (/[^/]+(?=_\d+$)/.exec($link.href) || [''])[0]
  if (!keyword) { return [doc] }

  let keywordTester = new RegExp(keyword + '_\\d+$')
  let $related = Array.from(doc.querySelectorAll('#relatedentries li a'))
    .filter(a => keywordTester.test(a.href))
  if ($related.length <= 0) { return [doc] }

  return reflect($related.map(a => fetchDom(a.href)))
    .then(docs => [doc].concat(docs.filter(d => d)))
}

function handleAllDom (docs) {
  let result = docs.map(handleDom).filter(x => x)
  if (result.length > 0) {
    return result
  }
  return Promise.reject('no result')
}

/**
* @typedef {Object} MacmillanResult
* @property {string} pos - part of speech
* @property {string} sc - syntax coding
* @property {string} phsym
* @property {string} audio
* @property {number} star
* @property {string[]} senses
*/

/**
 * @returns {Promise.<MacmillanResult>} A promise with the result to send back
 */
function handleDom (doc) {
  let def = {}

  let $headbar = doc.querySelector('#headbar')

  let $pos = $headbar.querySelector('.PART-OF-SPEECH')
  if ($pos) { def.pos = $pos.innerText }

  let $sc = $headbar.querySelector('.SYNTAX-CODING')
  if ($sc) { def.sc = $sc.innerText }

  let $pron = $headbar.querySelector('.PRON')
  if ($pron) { def.phsym = $pron.innerText }

  let $sound = $headbar.querySelector('.PRONS .sound')
  if ($sound && $sound.dataset.srcMp3) {
    def.audio = $sound.dataset.srcMp3
  }

  let $rate = doc.querySelector('.stars_grp')
  if ($rate) {
    def.star = $rate.querySelectorAll('.icon_star').length
  }

  let $senses = doc.querySelectorAll('.senses .SENSE')
  if ($senses.length > 0) {
    def.senses = Array.from($senses).map(el => el.innerHTML)
  }

  if (Object.keys(def).length > 0) {
    return def
  }

  return null
}
