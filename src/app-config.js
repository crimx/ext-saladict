export default function AppConfig () {
  return {
    active: true,

    // track search history
    searhHistory: true,
    // play sound
    newWordSound: true,

    // icon: show pop icon first
    // direct: show panel directly
    // double: double click
    // ctrl: show panel when double click ctrl + selection not empty
    mode: {
      icon: true,
      direct: false,
      double: false,
      ctrl: false
    },

    // when the panel is pinned
    // direct: on mouseup
    // double: double click
    // ctrl: search when double click ctrl + selection not empty
    pinMode: {
      direct: true,
      double: false,
      ctrl: false
    },

    // for double click, in ms
    doubleClickDelay: 450,

    // show panel when triple press ctrl
    tripleCtrl: true,
    // '': no preload
    // 'clipboard'
    // 'selection'
    tripleCtrlPreload: 'clipboard',
    // auto search
    tripleCtrlAuto: false,
    // 0: center
    // 1: top
    // 2: right
    // 3: bottom
    // 4: left
    // 5: top left
    // 6: top right
    // 7: bottom left
    // 8: bottom right
    tripleCtrlLocation: 0,

    // browser action
    // '': no preload
    // 'clipboard'
    // 'selection'
    baPreload: 'clipboard',
    // auto search
    baAuto: false,

    // source language
    language: {
      chinese: true,
      english: true
    },

    // auto pronounce
    autopron: {
      cn: {
        dict: '',
        list: ['zdic', 'guoyu']
      },
      en: {
        dict: '',
        list: ['bing', 'dictcn', 'howjsay', 'macmillan', 'eudic', 'urban'],
        // us / uk
        accent: 'uk'
      }
    },

    dicts: {
      // default selected dictionaries
      selected: ['bing', 'urban', 'vocabulary', 'dictcn'],
      all: {
        bing: {
          id: 'bing',
          page: 'https://cn.bing.com/dict/search?q=%s',
          defaultUnfold: true,
          preferredHeight: 240,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            tense: true,
            phsym: true,
            cdef: true,
            related: true,
            sentence: 4
          }
        },
        google: {
          id: 'google',
          page: 'https://translate.google.com/#auto/zh-CN/%s',
          defaultUnfold: true,
          preferredHeight: 110,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        urban: {
          id: 'urban',
          page: 'http://www.urbandictionary.com/define.php?term=%s',
          defaultUnfold: true,
          preferredHeight: 180,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            resultnum: 2
          }
        },
        vocabulary: {
          id: 'vocabulary',
          page: 'https://www.vocabulary.com/dictionary/%s',
          defaultUnfold: true,
          preferredHeight: 180,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        dictcn: {
          id: 'dictcn',
          page: 'http://dict.cn/%s',
          defaultUnfold: true,
          preferredHeight: 300,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            chart: true,
            etym: true
          }
        },
        eudic: {
          id: 'eudic',
          page: 'https://dict.eudic.net/dicts/en/%s',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        etymonline: {
          id: 'etymonline',
          page: 'http://www.etymonline.com/search?q=%s',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            resultnum: 2
          }
        },
        howjsay: {
          id: 'howjsay',
          page: 'http://www.howjsay.com/index.php?word=%s',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            related: true
          }
        },
        guoyu: {
          id: 'guoyu',
          page: 'https://www.moedict.tw/%z',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        liangan: {
          id: 'liangan',
          page: 'https://www.moedict.tw/~%z',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        zdic: {
          id: 'zdic',
          page: 'http://www.zdic.net/search/?c=1&q=%s',
          defaultUnfold: true,
          preferredHeight: 400,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        business: {
          id: 'business',
          page: 'http://www.ldoceonline.com/search/?q=%s',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        cobuild: {
          id: 'cobuild',
          page: 'https://www.collinsdictionary.com/dictionary/%s',
          secret: true,
          defaultUnfold: true,
          preferredHeight: 300,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        macmillan: {
          id: 'macmillan',
          page: 'http://www.macmillandictionary.com/dictionary/british/%s',
          defaultUnfold: true,
          preferredHeight: 265,
          showWhenLang: {
            eng: true,
            chs: true
          }
        },
        wordreference: {
          id: 'wordreference',
          page: 'http://www.wordreference.com/definition/%s',
          defaultUnfold: true,
          preferredHeight: 180,
          showWhenLang: {
            eng: true,
            chs: true
          },
          options: {
            etym: true,
            idiom: true
          }
        }
      }
    },
    contextMenu: {
      selected: ['oxford', 'google_translate', 'merriam_webster', 'cambridge', 'google_search', 'google_page_translate', 'youdao_page_translate'],
      all: {
        google_page_translate: '',
        youdao_page_translate: '',
        google_search: 'https://www.google.com/#newwindow=1&q=%s',
        baidu_search: 'https://www.baidu.com/s?ie=utf-8&wd=%s',
        bing_search: 'https://www.bing.com/search?q=%s',
        google_translate: 'https://translate.google.cn/#auto/zh-CN/%s',
        etymonline: 'http://www.etymonline.com/index.php?search=%s',
        merriam_webster: 'http://www.merriam-webster.com/dictionary/%s',
        oxford: 'http://www.oxforddictionaries.com/us/definition/english/%s',
        cambridge: 'http://dictionary.cambridge.org/spellcheck/english-chinese-simplified/?q=%s',
        youdao: 'http://dict.youdao.com/w/%s',
        dictcn: 'https://dict.eudic.net/dicts/en/%s',
        iciba: 'http://www.iciba.com/%s',
        liangan: 'https://www.moedict.tw/~%s',
        guoyu: 'https://www.moedict.tw/%s',
        longman_business: 'http://www.ldoceonline.com/search/?q=%s',
        bing_dict: 'https://cn.bing.com/dict/?q=%s'
      }
    }
  }
}
