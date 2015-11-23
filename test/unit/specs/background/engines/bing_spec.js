'use strict'

var engine = require('../../../../../src/js/background/engines/bing')

require('jasmine-ajax')

var LEX_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/lexicon?format=application/json&q='
var MACH_LINK = 'http://dict.bing.com.cn/api/http/v3/0003462a56234cee982be652b8ea1e5f/en-us/zh-cn/translation?format=application/json&q='
var LEX_RESPONSE = '{"Q":"hello","QD":{"C_DEF":[{"DEF":null,"POS":"int","SEN":[{"CONTEXT":null,"D":"你好；喂；您好；哈喽","R":0,"STS":null,"URL":null}]},{"DEF":null,"POS":"n","SEN":[{"CONTEXT":null,"D":"你好；嘿；（表示惊讶）嘿","R":0,"STS":null,"URL":null}]},{"DEF":null,"POS":"web","SEN":[{"CONTEXT":null,"D":"哈罗；哈啰；大家好","R":0,"STS":null,"URL":null}]}],"HW":{"DEF":"你好;您好;哈喽;喂,表示问候,打招呼或接电话时","SIG":"BFB1169AD46D18FDC9145E494EF4D22B","V":"hello"},"INF":null,"PRON":[{"L":"US","V":"heˈləʊ"},{"L":"UK","V":"hələʊ"}]}}'
var MACH_RESPONSE = '{"LEX":null,"MT":{"FROM":"9","S":"{2#hello$2} {1#world$1}","T":"{2#你好$2}{1#世界$1}","TO":"4","WA":2},"OxfD":null,"Q":"hello world","QD":null,"SENT":null,"SUGG":null}'
var WEB_PAGE = 'http://cn.bing.com/dict/search?q='

var newLexResult = function(url) {
  return {
    'msg': 'lex',
    'id': 'bing',
    'engine': '必应词典',
    'href': url,
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

var newMachResult = function(url) {
  return {
    'msg': 'mach',
    'id': 'bing',
    'engine': '必应词典',
    'href': url,
    'mt': '你好世界'
  }
}

var newNoResult = function(url) {
  return {
    'msg': null,
    'id': 'bing',
    'engine': '必应词典',
    'href': url,
  }
}

var ajaxMock = [{
  title: 'lexSmachF',
  msg: 'lex success'
},{
  title: 'lexFmachS',
  msg: 'lex faild & mach success',
},{
  title: 'lexFmachF',
  msg: 'lex faild & mach faild'
},{
  title: 'lexEmachS',
  msg: 'lex empty & mach success'
},{
  title: 'lexEmachE',
  msg: 'lex empty & mach empty'
}]

describe('background engine bing test', function() {

  beforeAll(function() {
    jasmine.Ajax.install()

    // stub ajax requests
    ajaxMock.forEach(function(m) {
      var lex = m.title[3]
      var mach = m.title[8]
      var r = {}

      r.link = MACH_LINK + m.title
      if (mach === 'S') {
        r.status = 200
        r.responseText = MACH_RESPONSE
        m.expect = newMachResult(WEB_PAGE + m.title)
      } else if (mach === 'E') {
        r.status = 200
        r.responseText = ''
        m.expect = newNoResult(WEB_PAGE + m.title)
      } else {
        r.status = 404
        r.responseText = null
        m.expect = newNoResult(WEB_PAGE + m.title)
      }
      jasmine.Ajax.stubRequest(r.link).andReturn({
        status: r.status,
        contentType: 'text/plain',
        responseText: r.responseText
      })

      r.link = LEX_LINK + m.title
      if (lex === 'S') {
        r.status = 200
        r.responseText = LEX_RESPONSE
        m.expect = newLexResult(WEB_PAGE + m.title)
      } else if (lex === 'E') {
        r.status = 200
        r.responseText = ''
      } else {
        r.status = 404
        r.responseText = null
      }
      jasmine.Ajax.stubRequest(r.link).andReturn({
        status: r.status,
        contentType: 'text/plain',
        responseText: r.responseText
      })
    })
  })

  afterAll(function() {
    jasmine.Ajax.uninstall()
  })

  // set up test for each circumstances
  ajaxMock.forEach(function(m) {
    // I know this looks weird. Can't find a better way to separate sync.
    describe('request engine bing', function() {
      var callback, result

      beforeEach(function(done) {
        callback = jasmine.createSpy('sendResponse')
        engine(m.title, function(res) {
          result = res
          callback()
          done()
        })
      })

      it('request (' + m.msg +')', function() {
        expect(callback).toHaveBeenCalled()
        expect(result).toEqual(m.expect)
      })
    })
  })
})
