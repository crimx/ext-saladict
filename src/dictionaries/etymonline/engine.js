import fetchDom from 'src/helpers/fetch-dom'
import stripScript from 'src/helpers/strip-script'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  const options = config.dicts.all.etymonline.options

  return fetchDom('http://www.etymonline.com/search?q=' + text)
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
  const result = Array.from(doc.querySelectorAll('[class^="word--"]'))
    .slice(0, resultnum)
    .map(el => {
      let href = el.getAttribute('href') || ''
      if (href[0] === '/') {
        href = 'http://www.etymonline.com' + href
      }

      let title
      let $title = el.querySelector('[class^="word__name--"]')
      if ($title) {
        title = $title.innerText.trim()
      }

      let def = ''
      let $def = el.querySelector('[class^="word__defination--"]>object')
      if ($def) {
        $def.querySelectorAll('.crossreference').forEach($cf => {
          let word = $cf.innerText.trim()
          $cf.innerHTML = `<a href="http://www.etymonline.com/word/${word}" target="_blank">${word}</a>`
        })
        const $cleanDef = doc.createElement('div')
        $cleanDef.innerHTML = $def.innerHTML
        def = stripScript($cleanDef).innerHTML
      }

      if (title && def) {
        return {
          title: `<a href="${href}" target="_blank">${title}</a>`,
          def
        }
      }
    })
    .filter(r => r)

  if (result.length > 0) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
