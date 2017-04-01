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
        preferredHeight: 140,
        options: {
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
        page: '',
        preferredHeight: 110
      },
      vocabulary: {
        id: 'vocabulary',
        favicon: 'vocabulary.png',
        page: '',
        preferredHeight: 110
      },
      dictcn: {
        id: 'dictcn',
        favicon: 'dictcn.png',
        page: '',
        preferredHeight: 110
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
