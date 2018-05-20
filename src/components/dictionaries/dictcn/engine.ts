import fetchDom from 'src/helpers/fetch-dom'
const mp3link = 'http://audio.dict.cn/'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @param {object} helpers - helper functions
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config, {AUDIO}) {
  const options = config.dicts.all.dictcn.options

  return fetchDom('http://dict.cn/' + text)
    .then(doc => handleDom(doc, options))
    .then(result => {
      if (config.autopron.en.dict === 'dictcn') {
        setTimeout(() => {
          playAudio(result, config, AUDIO)
        }, 0)
      }
      return result
    })
}

/**
* @typedef {Object} DictcnResult
* @property {string} title - keyword
* @property {string} level
* @property {number} star
* @property {Object[]} prons
* @property {string} prons[].phsym
* @property {string[]} prons[].audio - male & female
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

  let $level = doc.querySelector('.level-title')
  if ($level) { result.level = $level.getAttribute('level') }

  let $star = doc.querySelector('[class^="level_"]')
  if ($star) { result.star = Number($star.className.replace('level_', '')) }

  let $phonetic = doc.querySelector('.phonetic')
  if ($phonetic) {
    result.prons = Array.from($phonetic.children)
      .map(el => ({
        phsym: el.innerText.replace(/\s+/gm, ' ').trim(),
        audio: Array.from(el.querySelectorAll('.sound'))
          .map(x => mp3link + x.getAttribute('naudio'))
      }))
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

function playAudio (result, config, AUDIO) {
  if (result.prons) {
    const accentMap = {
      us: '美',
      uk: '英'
    }
    const accentTester = new RegExp(accentMap[config.autopron.en.accent], 'i')
    const isMatched = result.prons.some(({phsym, audio}) => {
      if (accentTester.test(phsym) && audio && audio[0]) {
        AUDIO.play(audio[0])
        return true
      }
    })

    if (!isMatched) {
      result.prons.some(({audio}) => {
        if (audio && audio[0]) {
          AUDIO.play(audio[0])
          return true
        }
      })
    }
  }
}
