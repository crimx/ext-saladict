const LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q='
const MACHINE_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q='
const PRONUNCIATION_LINK = 'https://dictionary.blob.core.chinacloudapi.cn/media/audio/'

export default function search (text, config) {
  const options = config.dicts.all.bing.options

  return searchLex(text, options)
    .then(null, () => searchMachine(text, options))
    .catch(e => Promise.reject(e))
}

function searchLex (text, options) {
  return fetch(LEX_LINK + text)
    .then(res => res.json())
    .then(data => handleLexResult(data, options))
}

function searchMachine (text, options) {
  return fetch(MACHINE_LINK + text)
    .then(res => res.json())
    .then(data => handleMachineResult(data, options))
}

/**
* Lex search result
* @typedef {Object} BingLex
* @property {string} type - Resutl type, 'lex'
* @property {Object[]} phsym - phonetic symbols
* @property {string} phsym[].lang - language('UK'|'US'|'PY')
* @property {string} phsym[].al - Phonetic Alphabet
* @property {string} phsym[].pron - pronunciation
* @property {Object[]} cdef - common definitions
* @property {string} cdef[].pos - part of speech
* @property {string} cdef[].def - definition
* @property {Object} inf - infinitive
*/

/**
 * @async
 * @returns {Promise.<BingLex>} A promise with the result to send back
 */
function handleLexResult (data, options) {
  if (!data.Q || !data.QD) { return Promise.reject('Bing Lex Error.') }

  var result = {
    type: 'lex'
  }

  // pronunciation
  if (data.QD.PRON && options.phsym) {
    result.phsym = data.QD.PRON.reduce((phsym, pron) => {
      var obj = {
        lang: chrome.i18n.getMessage(pron.L) || pron.L,
        al: `[${pron.V}]`
      }
      if (data.QD.HW.SIG) {
        let sig = data.QD.HW.SIG
        let sig1 = sig.slice(0, 2).toLowerCase()
        let sig2 = sig.slice(2, 4).toLowerCase()
        if (pron.L === 'US') {
          obj.pron = `${PRONUNCIATION_LINK}tom/${sig1}/${sig2}/${sig}.mp3`
        } else if (pron.L === 'UK') {
          obj.pron = `${PRONUNCIATION_LINK}george/${sig1}/${sig2}/${sig}.mp3`
        }
      }
      phsym.push(obj)
      return phsym
    }, [])
  }

  // definitions
  if (data.QD.C_DEF && options.cdef) {
    result.cdef = data.QD.C_DEF.map(d => ({
      'pos': d.POS,
      'def': d.SEN[0].D
    }))
  }

  // tense
  if (data.QD.INF && options.tense) {
    result.inf = {}
    data.QD.INF.forEach(inf => {
      result.inf[inf.T] = {
        word: inf.IE,
        tense: chrome.i18n.getMessage('inf_' + inf.T) || inf.T
      }
    })
  }

  return result
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
function handleMachineResult (data, options) {
  if (!data.MT || !data.MT.T) { return Promise.reject('Bing Machine Error.') }

  return {
    type: 'machine',
    mt: data.MT.T.replace(/(\{\d*#)|(\$\d*\})/g, '')
  }
}
