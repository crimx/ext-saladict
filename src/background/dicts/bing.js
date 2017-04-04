export default function search (text, config) {
  return new Promise((resolve, reject) => {
    const LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q='
    const MACHINE_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q='
    const PRONUNCIATION_LINK = 'http://media.engkoo.com:8129/'
    const options = config.dicts.all.bing.options

    searchLex()
      .then(passResolve, searchMachine)
      .then(sendBackResult, handleError)
      .catch(handleError)

    function searchLex () {
      return new Promise((resolve, reject) => {
        fetch(LEX_LINK + text)
        .then(res => res.json(), passReject)
        .then(handleLexResult, passReject)
        .then(resolve, reject)
        .catch(reject)
      })
    }

    function searchMachine () {
      return new Promise((resolve, reject) => {
        fetch(MACHINE_LINK + text)
          .then(res => res.json(), passReject)
          .then(handleMachineResult, passReject)
          .then(resolve, reject)
          .catch(reject)
      })
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
    function handleLexResult (data) {
      if (!data.Q || !data.QD) { return Promise.reject('Bing Lex Error.') }

      var result = {
        type: 'lex'
      }

      // pronunciation
      if (data.QD.PRON && options.phsym) {
        result.phsym = data.QD.PRON.reduce((phsym, pron) => {
          var obj = {
            lang: pron.L,
            al: `[${pron.V}]`
          }
          if (data.QD.HW.SIG) {
            if (pron.L === 'US') {
              obj.pron = PRONUNCIATION_LINK + 'en-us/' + data.QD.HW.SIG + '.mp3'
            } else if (pron.L === 'UK') {
              obj.pron = PRONUNCIATION_LINK + 'en-gb/' + data.QD.HW.SIG + '.mp3'
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
          result.inf[inf.T] = inf.IE
        })
      }

      return Promise.resolve(result)
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
    function handleMachineResult (data) {
      if (!data.MT || !data.MT.T) { return Promise.reject('Bing Machine Error.') }

      return Promise.resolve({
        type: 'machine',
        mt: data.MT.T.replace(/(\{\d*#)|(\$\d*\})/g, '')
      })
    }

    function sendBackResult (data) {
      resolve(data)
    }

    function handleError (reason) {
      reject(reason.toString())
    }

    function passResolve (data) {
      return Promise.resolve(data)
    }

    function passReject (reason) {
      return Promise.reject(reason)
    }
  })
}
