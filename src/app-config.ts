const allDicts = {
  bing: true,
  business: true,
  cobuild: true,
  dictcn: true,
  etymonline: true,
  eudic: true,
  google: true,
  guoyu: true,
  howjsay: true,
  liangan: true,
  macmillan: true,
  urban: true,
  vocabulary: true,
  wordreference: true,
  zdic: true,
}

export type DictID = keyof typeof allDicts

export type ContextMenuDictID =
  'baidu_search' |
  'bing_dict' |
  'bing_search' |
  'cambridge' |
  'dictcn' |
  'etymonline' |
  'google_page_translate' |
  'google_search' |
  'google_translate' |
  'guoyu' |
  'iciba' |
  'liangan' |
  'longman_business' |
  'merriam_webster' |
  'oxford' |
  'youdao_page_translate' |
  'youdao'

export enum TCDirection {
  center,
  top,
  right,
  bottom,
  left,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}

/** '' means no preload */
export type PreloadSource = '' | 'clipboard' | 'selection'

export interface DictConfig {
  page: string
  defaultUnfold: boolean
  preferredHeight: number
  selectionLang: {
    eng: boolean
    chs: boolean
  }
  options: {
    [option: string]: number | boolean
  }
}

export interface AppConfig {
  version: number,
  /** activate app, won't affect triple-ctrl setting */
  active: boolean

  /** sniff pdf request */
  pdfSniff: boolean

  /** track search history */
  searhHistory: boolean
  /** play sound */
  newWordSound: boolean

  /** when and how to search text */
  mode: {
    /** show pop icon first */
    icon: boolean
    /** how panel directly */
    direct: boolean
    /** double click */
    double: boolean
    /** show panel when double click ctrl + selection not empty */
    ctrl: boolean
  },

  /** when and how to search text if the panel is pinned */
  pinMode: {
    /** direct: on mouseup */
    direct: boolean
    /** double: double click */
    double: boolean
    /** ctrl: search when double click ctrl + selection not empty */
    ctrl: boolean
  },

  /** double click delay, in ms */
  doubleClickDelay: number

  /** show panel when triple press ctrl */
  tripleCtrl: boolean

  /** preload source */
  tripleCtrlPreload: PreloadSource

  /** auto search when triple hit ctrl */
  tripleCtrlAuto: boolean

  /** where should the dict appears */
  tripleCtrlLocation: TCDirection

  /** browser action preload source */
  baPreload: PreloadSource

  /** auto search when browser action triggered */
  baAuto: boolean

  /** start searching when source containing the languages */
  language: {
    chinese: boolean
    english: boolean
  }

  /** auto pronunciation */
  autopron: {
    cn: {
      dict: DictID | '',
      readonly list: DictID[]
    }
    en: {
      dict: DictID | '',
      readonly list: DictID[]
      accent: 'us' | 'uk'
    }
  }

  dicts: {
    /** default selected dictionaries */
    selected: DictID[]
    // settings of each dict will be auto-generated
    readonly all: {
      readonly [id in DictID]: true
    }
  }
  contextMenus: {
    selected: ContextMenuDictID[]
    readonly all: {
      readonly [id in ContextMenuDictID]: string
    }
  }
}

export default appConfigFactory

export function appConfigFactory (): AppConfig {
  return {
    version: 6,
    active: true,
    pdfSniff: true,
    searhHistory: true,
    newWordSound: true,
    mode: {
      icon: true,
      direct: false,
      double: false,
      ctrl: false
    },

    pinMode: {
      direct: true,
      double: false,
      ctrl: false
    },

    doubleClickDelay: 450,

    tripleCtrl: true,

    tripleCtrlPreload: 'clipboard' as PreloadSource,

    tripleCtrlAuto: false,

    tripleCtrlLocation: TCDirection.center,

    baPreload: 'clipboard' as PreloadSource,

    baAuto: false,

    language: {
      chinese: true,
      english: true
    },

    autopron: {
      cn: {
        dict: '',
        list: ['zdic', 'guoyu']
      },
      en: {
        dict: '',
        list: ['bing', 'dictcn', 'howjsay', 'macmillan', 'eudic', 'urban'],
        accent: 'uk' as ('us' | 'uk')
      }
    },

    dicts: {
      selected: ['bing', 'urban', 'vocabulary', 'dictcn'],
      // settings of each dict will be auto-generated
      all: Object.assign({}, allDicts) as AppConfig['dicts']['all']
    },
    contextMenus: {
      selected: ['oxford', 'google_translate', 'merriam_webster', 'cambridge', 'google_search', 'google_page_translate', 'youdao_page_translate'],
      all: {
        google_page_translate: 'x',
        youdao_page_translate: 'x',
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
