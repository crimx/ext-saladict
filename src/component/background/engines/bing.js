// bing dict engine

'use strict'

var utils = require('../../utils')

module.exports = function(text, sendResponse) {
  var LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q='
  var MACH_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q='
  var PRON_LINK = 'http://media.engkoo.com:8129/'
  var WEBPAGE = 'http://cn.bing.com/dict/search?q='

  var engineInfo = {
    id: 'bing',
    engine: chrome.i18n.getMessage('engine_bing'),
    href: WEBPAGE + text
  }

  /* 
   * lexical translation response:
   *   msg[string]: 'lex'
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: result webpage
   *   title[string]: search title
   *   phsym[array]: phonetic symbols
   *     [object]
   *       - lang[string]: language('UK'|'US'|'PY')
   *       - al[string]: Phonetic Alphabet
   *       - pron[string]: pronunciation
   *   cdef[array]: common definitions
   *     [object]
   *       - 'pos'[string] part of speech
   *       - 'def'[string] definition
   */
  function lexChecker(response) {
    var data

    try {
      data = JSON.parse(response)
    } catch (err) {
      return goMachine()
    }

    if (!data.Q || !data.QD) {
      // no lexical result
      return goMachine()
    }

    var result = {
      msg: 'lex',
      id: engineInfo.id,
      engine: engineInfo.engine,
      href: engineInfo.href,
      title: data.QD.HW.V || data.Q,
    }

    if (data.QD.PRON) {
      result.phsym = []

      data.QD.PRON.forEach(function(p) {
        var obj = {}
        obj.lang = chrome.i18n.getMessage(p.L)
        obj.al = '[' + p.V + ']'
        if (data.QD.HW.SIG) {
          if (p.L === 'US') {
            obj.pron = PRON_LINK + 'en-us/' + data.QD.HW.SIG + '.mp3'
          } else if (p.L === 'UK') {
            obj.pron = PRON_LINK + 'en-gb/' + data.QD.HW.SIG + '.mp3'
          }
        }
        result.phsym.push(obj)
      })
    }

    if (data.QD.C_DEF) {
      result.cdef = []

      data.QD.C_DEF.forEach(function(d) {
        result.cdef.push({
          'pos': d.POS,
          'def': d.SEN[0].D
        })
      })
    }
    
    sendResponse(result)
  }

  /* 
   * machine translation response:
   *   msg[string]: 'mach'
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: dictionary link
   *   mt[string]: machine translation
   */
  function machChecker(response) {
    var data
    
    try {
      data = JSON.parse(response)
    } catch (err) {
      return noResult()
    }

    if (data.MT && data.MT.T) {
      sendResponse({
        msg: 'mach',
        id: engineInfo.id,
        engine: engineInfo.engine,
        href: engineInfo.href,
        mt: data.MT.T.replace(/(\{\d*#)|(\$\d*\})/g, '')
      })
    } else {
      noResult()
    }
  }

  /* 
   * no result response:
   *   msg[string]: null
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: dictionary link
   */
  function noResult() {
    sendResponse({
      msg: null,
      id: engineInfo.id,
      engine: engineInfo.engine,
      href: engineInfo.href
    })
  }

  function goLex() {
    utils.get(LEX_LINK + text)
      .then(lexChecker, goMachine)
  }

  function goMachine() {
    utils.get(MACH_LINK + text)
      .then(machChecker, noResult)
  }

  /* ******* *\
      begin
  \* ******* */
  // check how many words in `text`, 3 spaces means 4 words. 
  var spaces = text.match(/\ +/g)
  if (!spaces || spaces.length < 4) {
    goLex()
  } else {
    goMachine()
  }
}
