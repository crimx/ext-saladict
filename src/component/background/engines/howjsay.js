'use strict'

// howjsay pronunciation

var utils = require('../../utils')

module.exports = function(text, sendResponse) {
  var WEBPAGE = 'http://www.howjsay.com/index.php?word='
  var MP3LINK = 'http://www.howjsay.com/mp3/'

  var engineInfo = {
    id: 'howjsay',
    engine: chrome.i18n.getMessage('engine_howjsay'),
    href: WEBPAGE + text
  }

  /* 
   * translation response:
   *   msg[string]: 'mach'
   *   id[string]: engine ID
   *   engine[string]: engine name
   *   href[string]: dictionary link
   *   phsym[object]:
   *       - text[string]: search text
   *       - pron[string]: pronunciation
   *       - before[array]: related words before search text
   *          - [object]:
   *             - text[string]: search text
   *             - pron[string]: pronunciation
   *             - href[string]: word link
   *       - after[array]: related words after search text
   *          - [object]:
   *             - text[string]: search text
   *             - pron[string]: pronunciation
   *             - href[string]: word link
   */
  function checker(response) {
    // no result
    if (/Our nearest entry is/i.test(response)) {
      // get nearest result
      var newText = /word=(.+?)\&/i.exec(response)
      if (newText) {
        utils.get(WEBPAGE + newText[1])
          .then(checker, noResult)
      } else {
        noResult()
      }
      return
    }

    var result = {
      msg: 'mach',
      id: engineInfo.id,
      engine: engineInfo.engine,
      href: engineInfo.href,
      phsym: {}
    }

    // get the origin word
    result.phsym.text = /word=(.+?)\&pl/i.exec(response)
    if (result.phsym.text) {
      result.phsym.text = result.phsym.text[1]
      result.phsym.pron = MP3LINK + result.phsym.text.toLowerCase() + '.mp3'
    } else {
      noResult()
      return
    }

    // get related words
    var wordChecker = /index.php\?word=(.+?)\&submit=Submit/ig
    var words = []
    var w, obj

    while ((w = wordChecker.exec(response))) {
      obj = {
        text: w[1],
        pron: MP3LINK + w[1] + '.mp3',
        href: WEBPAGE + w[1]
      }
      words.push(obj)
    }

    if (words) {
      result.phsym.before = words.slice(0, words.length/2)
      result.phsym.after = words.slice(words.length/2)
    }

    sendResponse(result)
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
