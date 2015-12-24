// urban dictionary

'use strict'

var utils = require('../../utils')

module.exports = function(text, sendResponse) {
  var WEBPAGE = 'http://www.urbandictionary.com/define.php?term='

  var engineInfo = {
    id: 'ud',
    engine: chrome.i18n.getMessage('engine_ud'),
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
    var meaning = /class=["']meaning["']>([^]*?)<\/div>/i.exec(response)
    var example = /class=["']example["']>([^]*?)<\/div>/i.exec(response)

    if (!meaning || !example) {
      noResult()
      return
    }

    sendResponse({
      msg: 'mach',
      id: engineInfo.id,
      engine: engineInfo.engine,
      href: engineInfo.href,
      mt: meaning[1],
      more: example[1]
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
