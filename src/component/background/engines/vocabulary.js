// Vocabulary.com dictionary

'use strict'

var utils = require('../../utils')

module.exports = function(text, sendResponse) {
  var WEBPAGE = 'http://www.vocabulary.com/dictionary/'

  var engineInfo = {
    id: 'vocabulary',
    engine: chrome.i18n.getMessage('engine_vocabulary'),
    href: WEBPAGE + text
  }

  /* 
   * translation response:
   *   msg[string]: 'mach'
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: dictionary link
   *   mt[string]: translation
   *   more[string]: more explanation
   */
  function checker(response) {
    var short = /class=["']short["']>([^]*?)<\/p>/i.exec(response)
    var long = /class=["']long["']>([^]*?)<\/p>/i.exec(response)

    if (!short) {
      noResult()
      return
    }

    sendResponse({
      msg: 'mach',
      id: engineInfo.id,
      engine: engineInfo.engine,
      href: engineInfo.href,
      mt: short[1],
      more: long && long[1]
    })
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


  /* ******* *\
      begin
  \* ******* */
  utils.get(WEBPAGE + text)
    .then(checker, noResult)
}
