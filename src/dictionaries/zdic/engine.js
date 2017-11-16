import fetchDom from 'src/helpers/fetch-dom'
import stripScript from 'src/helpers/strip-script'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  const options = config.dicts.all.bing.options
  const SEARCH_LINK = 'http://www.zdic.net/search/?c=3&q='
  text = text.trim()

  return fetchDom(SEARCH_LINK + text)
    .then(cleanDom)
    .then(doc => {
      if (doc.querySelector('#tagContent0')) {
        return handleWord(doc, options)
      } else {
        return handlePhrase(doc, options)
      }
    })
}

/**
* @typedef {Object} ZdicResult
* @property {Object[]} [phsym] - phonetic symbols
* @property {string} phsym[].pinyin - Pinyin
* @property {string} phsym[].pron - pronunciation src
* @property {string} html - html code
*/

/**
 * @async
 * @returns {Promise.<ZdicResult>} A promise with the result to send back
 */
function handleWord (doc, options) {
  var result = {
    phsym: []
  }
  const $content = doc.querySelector('#tagContent0')
  const $zui = $content.querySelector('.zui')
  if ($zui) {
    $zui.querySelectorAll('.dicpy a').forEach($a => {
      result.phsym.push({
        pinyin: $a.innerText.trim(),
        pron: `http://www.zdic.net/p/mp3/${($a.href.match(/[^=]+$/) || [''])[0]}.mp3`
      })
    })
    $zui.remove()
  }

  const $diczx7 = $content.querySelector('.diczx7')
  if ($diczx7) { $diczx7.parentElement.remove() }
  const $diczx6 = $content.querySelector('.diczx6')
  if ($diczx6) { $diczx6.parentElement.remove() }

  $content.querySelectorAll('script').forEach(el => el.remove())
  // mark header
  $content.querySelectorAll('.dichr').forEach($hr => {
    $hr.previousElementSibling.classList.add('zdic-header')
  })
  result.html = stripScript($content).innerHTML

  return result
}

/**
 * @async
 * @returns {Promise.<ZdicResult>} A promise with the result to send back
 */
function handlePhrase (doc, options) {
  const result = {}
  const $cdnr = doc.querySelector('.cdnr')

  // get pinyin and remove script
  $cdnr.querySelectorAll('script').forEach(el => {
    if (!result.phsym) {
      const p = el.innerText.match(/\("(.*)"\)/)
      if (p) {
        const $pinyins = $cdnr.querySelector('.dicpy')
        if ($pinyins) {
          const prons = p[1].split(' ')
          const pinyins = $pinyins.innerText.trim().split(' ')
          if (prons.length === pinyins.length) {
            result.phsym = pinyins.map((pinyin, i) => ({
              pinyin,
              pron: `http://www.zdic.net/p/mp3/${prons[i]}.mp3`
            }))
          }
        }
      }
    }
    el.remove()
  })
  result.html = stripScript($cdnr).innerHTML
  return result
}

function cleanDom (doc) {
  const testStyle = /\.(\S+)(?=\s?\{\s*display\s?:\s?none)/ig
  doc.querySelectorAll('style').forEach($style => {
    ($style.innerText.match(testStyle) || [])
      .forEach(className => {
        doc.querySelectorAll(className).forEach($junkClass => $junkClass.remove())
      })
  })

  return doc
}

