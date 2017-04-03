const getConfig = () => ({
  active: true,

  // icon: show pop icon first
  // direct: show panel directly
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
    selected: ['bing', 'iciba', 'urban', 'vocabulary', 'dictcn'],
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
      iciba: {
        id: 'iciba',
        favicon: 'iciba.png',
        page: '',
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
        page: '',
        preferredHeight: 110
      }
    }
  }
})

let config = {}
Object.defineProperty(config, 'get', {
  get: getConfig
})

export default config.get
