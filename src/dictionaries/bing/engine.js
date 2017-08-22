import fetchDom from 'src/helpers/fetch-dom'

/**
 * Search text and give back result
 * @param {string} text - Search text
 * @param {object} config - app config
 * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
 */
export default function search (text, config) {
  const options = config.dicts.all.bing.options
  const DICT_LINK = 'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q='

  return fetchDom(DICT_LINK + text)
    .then(doc => handleDom(doc, options))
}

function handleDom (doc, options) {
  if (doc.querySelector('.client_def_hd_hd')) {
    return handleLexResult(doc, options)
  }

  if (doc.querySelector('.client_trans_head')) {
    return handleMachineResult(doc, options)
  }

  return Promise.reject('no result')
}

/**
* Lex search result
* @typedef {Object} BingLex
* @property {string} type - Resutl type, 'lex'
* @property {string} title
* @property {Object[]} phsym - phonetic symbols
* @property {string} phsym[].lang - language('UK'|'US'|'PY') Phonetic Alphabet
* @property {string} phsym[].pron - pronunciation
* @property {Object[]} cdef - common definitions
* @property {string} cdef[].pos - part of speech
* @property {string} cdef[].def - definition
* @property {string[]} infs - infinitive
* @property {Object[]} sentences
* @property {string} sentences[].en
* @property {string} sentences[].chs
* @property {string} sentences[].source
* @property {string} sentences[].mp3
*/

/**
 * @async
 * @returns {Promise.<BingLex>} A promise with the result to send back
 */
function handleLexResult (doc, options) {
  let result = {
    type: 'lex',
    title: getText(doc, '.client_def_hd_hd')
  }

  // pronunciation
  if (options.phsym) {
    let $prons = Array.from(doc.querySelectorAll('.client_def_hd_pn_list'))
    if ($prons.length > 0) {
      result.phsym = $prons.map(el => {
        let pron = ''
        let $audio = el.querySelector('.client_aud_o')
        if ($audio) {
          pron = (($audio.getAttribute('onclick') || '').match(/https.*\.mp3/) || [''])[0]
        }
        return {
          lang: getText(el, '.client_def_hd_pn'),
          pron
        }
      })
    }
  }

  // definitions
  if (options.cdef) {
    let $container = doc.querySelector('.client_def_container')
    if ($container) {
      let $defs = Array.from($container.querySelectorAll('.client_def_bar'))
      if ($defs.length > 0) {
        result.cdef = $defs.map(el => ({
          'pos': getText(el, '.client_def_title_bar'),
          'def': getText(el, '.client_def_list')
        }))
      }
    }
  }

  // tense
  if (options.tense) {
    let $infs = Array.from(doc.querySelectorAll('.client_word_change_word'))
    if ($infs.length > 0) {
      result.infs = $infs.map(el => el.innerText.trim())
    }
  }

  if (options.sentence > 0) {
    let $sens = Array.from(doc.querySelectorAll('.client_sentence_list'))
    if ($sens.length > 0) {
      result.sentences = $sens.map(el => {
        let mp3 = ''
        let $audio = el.querySelector('.client_aud_o')
        if ($audio) {
          mp3 = (($audio.getAttribute('onclick') || '').match(/https.*\.mp3/) || [''])[0]
        }
        return {
          en: getText(el, '.client_sen_en'),
          chs: getText(el, '.client_sen_cn'),
          source: getText(el, '.client_sentence_list_link'),
          mp3
        }
      })
      .slice(0, options.sentence)
    }
  }

  if (Object.keys(result).length > 0) {
    return result
  }
  return Promise.reject('no result')
}

/**
* Machine translation result
* @typedef {Object} BingMachine
* @property {string} type - Resutl type, 'machine'
* @property {string} mt - machine translation
*/

/**
 * @async
 * @returns {Promise.<BingMachine>} A promise with the result to send back
 */
function handleMachineResult (doc, options) {
  return {
    type: 'machine',
    mt: getText(doc, '.client_sen_cn')
  }
}

function getText (el, childSelector) {
  var child = el.querySelector(childSelector)
  if (child) {
    return child.innerText.trim()
  }
  return ''
}
