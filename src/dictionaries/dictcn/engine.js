import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  const options = config.dicts.all.dictcn.options

  return fetchDom('http://dict.cn/' + text)
    .then(doc => handleDom(doc, options))
    .catch(e => Promise.reject(e))
}

/**
* @typedef {Object} DictcnResult
* @property {string} title - keyword
* @property {Object} chart - for highcharts options
* @property {string[]} etym - etymology
*/

/**
 * @async
 * @returns {Promise.<DictcnResult>} A promise with the result to send back
 */
function handleDom (doc, options) {
  let result = {}

  // title
  let $title = doc.querySelector('.keyword')
  if ($title) {
    result.title = $title.innerText
  }

  if (options.chart) {
    // chart
    try {
      result.chart = JSON.parse(decodeURIComponent(doc.getElementById('dict-chart-basic').getAttribute('data')))
    } catch (e) {}
  }

  if (options.etym) {
    // etymology
    let $etym = doc.querySelector('.etm')
    if ($etym && $etym.innerText) {
      result.etym = $etym.innerText.split('\n')
    }
  }

  if (Object.keys(result).length <= 1) {
    return Promise.reject('no result')
  }

  return result
}
