import fetchDom from 'src/helpers/fetch-dom'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  const options = config.dicts.all.etymonline.options

  return fetchDom('http://www.etymonline.com/index.php?search=' + text)
    .then(doc => handleDom(doc, options))
}

/**
* @typedef {Object} EymonlineResult
* @property {string} title - keyword
* @property {string} def - definition
*/

/**
 * @async
 * @returns {Promise.<EymonlineResult[]>} A promise with the result to send back
 */
function handleDom (doc, {resultnum}) {
  let dictionary = doc.querySelector('#dictionary dl')

  // strip script tags, just in case
  dictionary.querySelectorAll('script').forEach(el => el.parentNode.removeChild(el))

  // resolve href
  dictionary.querySelectorAll('a').forEach(el => {
    let href = el.getAttribute('href')
    if (href && href[0] === '/') {
      el.setAttribute('href', el.href)
    }
  })

  let titles = dictionary.querySelectorAll('dt')
  let defs = dictionary.querySelectorAll('dd')

  let result = Array.from(titles).map((title, i) => ({
    title: title.firstElementChild.outerHTML,
    def: defs[i].innerHTML.replace(/<br>[\s\S]?<br>/, '<div class="line-break"></div>')
  }))

  result = result.slice(0, resultnum)

  if (result.length > 0) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
