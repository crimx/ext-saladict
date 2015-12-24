'use strict'

var utils = require('../../utils')

module.exports = function(text, sendResponse) {
  var WEBPAGE = 'http://dict.cn/'

  var engineInfo = {
    id: 'dictcn',
    engine: chrome.i18n.getMessage('engine_dictcn'),
    href: WEBPAGE + text
  }

  /* 
   * translation response:
   *   msg[string]: 'mach'
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: dictionary link
   *   data[object]:
   *     [object]:
   *       percent[string]: precentage
   *       sense[string]: sense
   */
  function checker(response) {
    var data
    if (data = /dict\-chart\-basic.+?data="(.+?)">/i.exec(response)) {
      try {
        data = JSON.parse(decodeURIComponent(data[1]))
      } catch (e) {
        noResult()
      }
      sendResponse({
        msg: 'mach',
        id: engineInfo.id,
        engine: engineInfo.engine,
        href: engineInfo.href,
        data: data
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


  /* ******* *\
      begin
  \* ******* */
  utils.get(WEBPAGE + text)
    .then(checker, noResult)
}
