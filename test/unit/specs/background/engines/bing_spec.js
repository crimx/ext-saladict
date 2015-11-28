'use strict'

var engine = require('../../../../../src/component/background/engines/bing')

require('jasmine-ajax')

var LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q='
var MACH_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q='
var WEB_PAGE = 'http://cn.bing.com/dict/search?q='

// add task here
var ajaxMocks = [{
  title: 'lex success',
  lexResopnse: LexResopnseFactory(),
  expectResult: expectLexResult
}, {
  title: 'lex success(no data.QD.HW.V)',
  lexResopnse: LexResopnseFactory('noQD.HW.V'),
  expectResult: expectLexResult
}, {
  title: 'lex faild(no data.Q) & mach success',
  lexResopnse: LexResopnseFactory('noQ'),
  machResopnse: machResopnseFactory(),
  expectResult: expectMachResult
}, {
  title: 'lex faild(no JSON) & mach faild(no JSON)',
  lexResopnse: 'invalid JSON',
  machResopnse: 'invalid JSON',
  expectResult: expectNoResult
}, {
  title: 'lex faild(no JSON) & mach faild(no data.MT.T)',
  lexResopnse: 'invalid JSON',
  machResopnse: machResopnseFactory('noMT.T'),
  expectResult: expectNoResult
}]

describe('background engine bing test', function() {

  beforeAll(function() {
    // stub i18n
    chrome.i18n.getMessage.withArgs('engine_bing').returns('必应词典')

    jasmine.Ajax.install()

    var key = 0 // unique id for each spec
    // stub ajax requests
    ajaxMocks.forEach(function(aMock) {
      aMock.key = key++
      aMock.expectResult = aMock.expectResult(aMock.key)

      // lexical search request
      jasmine.Ajax.stubRequest(LEX_LINK + aMock.key).andReturn({
        status: typeof aMock.lexResopnse !== 'undefined' ? 200: 404,
        contentType: 'text/plain',
        responseText: aMock.lexResopnse
      })

      // machine search request
      jasmine.Ajax.stubRequest(MACH_LINK + aMock.key).andReturn({
        status: typeof aMock.machResopnse !== 'undefined' ? 200: 404,
        contentType: 'text/plain',
        responseText: aMock.machResopnse
      })
    })
  })

  afterAll(function() {
    jasmine.Ajax.uninstall()
  })

  // set up test for each circumstances
  ajaxMocks.forEach(function(aMock) {
    // I know this looks weird. Can't find a better way to separate sync.
    describe('request engine bing', function() {
      var result

      beforeEach(function(done) {
        engine(aMock.key, function(res) {
          result = res
          done()
        })
      })

      it('request (' + aMock.title +')', function() {
        expect(result).toEqual(aMock.expectResult)
      })
    })
  })
})



// generate lexical search response string
function LexResopnseFactory() {
  var obj = {
    'Q': 'hello',
    'QD': {
      'C_DEF': [{
        'POS': 'int',
        'SEN': [{
          'D': '你好；喂；您好；哈喽'
        }]
      }, {
        'POS': 'n',
        'SEN': [{
          'D': '你好；嘿；（表示惊讶）嘿'
        }]
      }, {
        'POS': 'web',
        'SEN': [{
          'D': '哈罗；哈啰；大家好'
        }]
      }],
      'HW': {
        'SIG': 'BFB1169AD46D18FDC9145E494EF4D22B',
        'V': 'hello'
      },
      'PRON': [{
        'L': 'US',
        'V': 'heˈləʊ'
      }, {
        'L': 'UK',
        'V': 'hələʊ'
      }]
    }
  }

  for (var i = 0; i < arguments.length; i += 1) {
    switch (arguments[i]) {
    case 'noQ':
      obj.Q = null
      break
    case 'noQD':
      obj.QD = null
      break
    case 'noQD.HW.V':
      obj.QD.HW.V = null
      break
    default:
      break
    }
  }

  return JSON.stringify(obj)
}

// generate machine search response string
function machResopnseFactory() {
  var obj = {
    'MT': {
      'T': '{2#你好$2}{1#世界$1}'
    }
  }

  for (var i = 0; i < arguments.length; i += 1) {
    switch (arguments[i]) {
    case 'noMT':
      obj.MT = null
      break
    case 'noMT.T':
      obj.MT.T = null
      break
    default:
      break
    }
  }

  return JSON.stringify(obj)
}


// genera expected lexical search result
function expectLexResult(key) {
  return {
    'msg': 'lex',
    'id': 'bing',
    'engine': '必应词典',
    'href': WEB_PAGE + key,
    'title': 'hello',
    'phsym': [{
      'L': 'US',
      'V': 'heˈləʊ'
    }, {
      'L': 'UK',
      'V': 'hələʊ'
    }],
    'pron': {
      'US': 'http://media.engkoo.com:8129/en-us/BFB1169AD46D18FDC9145E494EF4D22B.mp3',
      'UK': 'http://media.engkoo.com:8129/en-gb/BFB1169AD46D18FDC9145E494EF4D22B.mp3'
    },
    'cdef': [{
      'pos': 'int',
      'def': '你好；喂；您好；哈喽'
    }, {
      'pos': 'n',
      'def': '你好；嘿；（表示惊讶）嘿'
    }, {
      'pos': 'web',
      'def': '哈罗；哈啰；大家好'
    }]
  }
}

// genera expected machine search result
function expectMachResult(key) {
  return {
    'msg': 'mach',
    'id': 'bing',
    'engine': '必应词典',
    'href': WEB_PAGE + key,
    'mt': '你好世界'
  }
}

// genera expected no search result
function expectNoResult(key) {
  return {
    'msg': null,
    'id': 'bing',
    'engine': '必应词典',
    'href': WEB_PAGE + key,
  }
}
