const getConfig = () => ({
  active: true,

  // icon: show pop icon first
  // direct: show panel directly
  // double: double click
  // ctrl: show panel when double click ctrl + selection not empty
  mode: 'icon',

  // show panel when triple press ctrl
  tripleCtrl: true,

  // source language
  language: {
    chinese: true,
    english: true
  },

  dicts: {
    // default selected dictionaries
    selected: ['bing', 'urban', 'vocabulary', 'dictcn'],
    all: {
      bing: {
        id: 'bing',
        favicon: 'bing.png',
        page: 'https://cn.bing.com/dict/search?q=%s',
        preferredHeight: 160,
        options: {
          tense: true,
          phsym: true,
          cdef: true
        }
      },
      google: {
        id: 'google',
        favicon: 'google.png',
        page: 'https://translate.google.com/#auto/zh-CN/%s',
        preferredHeight: 110
      },
      urban: {
        id: 'urban',
        favicon: 'urban.png',
        page: 'http://www.urbandictionary.com/define.php?term=%s',
        preferredHeight: 180,
        options: {
          resultnum: 2
        }
      },
      vocabulary: {
        id: 'vocabulary',
        favicon: 'vocabulary.png',
        page: 'https://www.vocabulary.com/dictionary/%s',
        preferredHeight: 180
      },
      dictcn: {
        id: 'dictcn',
        favicon: 'dictcn.png',
        page: 'http://dict.cn/%s',
        preferredHeight: 265,
        options: {
          chart: true,
          etym: true
        }
      },
      wordreference: {
        id: 'wordreference',
        favicon: 'wordreference.png',
        page: 'http://www.wordreference.com/definition/%s',
        preferredHeight: 180,
        options: {
          etym: true,
          idiom: true
        }
      }
    }
  },
  contextMenu: {
    selected: ['oxford', 'etymonline', 'google_translate', 'merriam_webster', 'cambridge', 'google_search'],
    all: {
      google_search: 'https://www.google.com/#newwindow=1&q=%s',
      baidu_search: 'https://www.baidu.com/s?ie=utf-8&wd=%s',
      bing_search: 'https://www.bing.com/search?q=%s',
      google_translate: 'https://translate.google.com/#auto/zh-CN/%s',
      etymonline: 'http://www.etymonline.com/index.php?search=%s',
      merriam_webster: 'http://www.merriam-webster.com/dictionary/%s',
      oxford: 'http://www.oxforddictionaries.com/us/definition/english/%s',
      cambridge: 'http://dictionary.cambridge.org/dictionary/english-chinese-simplified/%s',
      bing_dict: 'https://cn.bing.com/dict/?q=%s'
    }
  }
})

let config = {}
Object.defineProperty(config, 'get', {
  get: getConfig
})

export default config.get
