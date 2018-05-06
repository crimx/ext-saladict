import cloneDeep from 'lodash/cloneDeep'
import { DeepReadonly } from './typings/helpers'

const langUI = (browser.i18n.getUILanguage() || 'en').replace('-', '_')
const langCode = /^zh_CN|zh_TW|en$/.test(langUI)
  ? langUI === 'zh_HK'
    ? 'zh_TW'
    : langUI
  : 'en'

const allDicts = {
  bing: {
    page: 'https://cn.bing.com/dict/search?q=%s',
    defaultUnfold: true,
    preferredHeight: 240,
    selectionLang: {
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
  business: {
    page: 'http://www.ldoceonline.com/search/?q=%s',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  cobuild: {
    page: 'https://www.collinsdictionary.com/dictionary/%s',
    secret: true,
    defaultUnfold: true,
    preferredHeight: 300,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  dictcn: {
    page: 'http://dict.cn/%s',
    defaultUnfold: true,
    preferredHeight: 300,
    selectionLang: {
      eng: true,
      chs: true
    },
    options: {
      chart: true,
      etym: true
    }
  },
  etymonline: {
    page: 'http://www.etymonline.com/search?q=%s',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    },
    options: {
      resultnum: 2
    }
  },
  eudic: {
    page: 'https://dict.eudic.net/dicts/en/%s',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  google: {
    page: 'https://translate.google.com/#auto/zh-CN/%s',
    defaultUnfold: true,
    preferredHeight: 110,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  guoyu: {
    page: 'https://www.moedict.tw/%z',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  howjsay: {
    page: 'http://www.howjsay.com/index.php?word=%s',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    },
    options: {
      related: true
    }
  },
  liangan: {
    page: 'https://www.moedict.tw/~%z',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  macmillan: {
    page: 'http://www.macmillandictionary.com/dictionary/british/%s',
    defaultUnfold: true,
    preferredHeight: 265,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  urban: {
    page: 'http://www.urbandictionary.com/define.php?term=%s',
    defaultUnfold: true,
    preferredHeight: 180,
    selectionLang: {
      eng: true,
      chs: true
    },
    options: {
      resultnum: 2
    }
  },
  vocabulary: {
    page: 'https://www.vocabulary.com/dictionary/%s',
    defaultUnfold: true,
    preferredHeight: 180,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
  wordreference: {
    page: 'http://www.wordreference.com/definition/%s',
    defaultUnfold: true,
    preferredHeight: 180,
    selectionLang: {
      eng: true,
      chs: true
    },
    options: {
      etym: true,
      idiom: true
    }
  },
  zdic: {
    page: 'http://www.zdic.net/search/?c=1&q=%s',
    defaultUnfold: true,
    preferredHeight: 400,
    selectionLang: {
      eng: true,
      chs: true
    }
  },
}

// Just for type check. Keys in allDicts are useful so no actual assertion
// tslint:disable-next-line:no-unused-expression
allDicts as { [id: string]: DictConfig }

export type DictID = keyof typeof allDicts

const allContextMenus = {
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

// Just for type check. Keys in allContextMenus are useful so no actual assertion
// tslint:disable-next-line:no-unused-expression
allContextMenus as { [id: string]: string }

export type ContextMenuDictID = keyof typeof allContextMenus

export const enum TCDirection {
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

export type DictConfig = DeepReadonly<DictConfigMutable>

export type DictConfigs = { [id in DictID]: DictConfig }

export interface DictConfigMutable {
  /** url for the complete result */
  page: string
  /** lazy load */
  defaultUnfold: boolean
  /** content below the preferrred height will be hidden by default */
  preferredHeight: number
  /** only search when the selection contains the language */
  selectionLang: {
    eng: boolean
    chs: boolean
  }
  /** other options */
  options?: {
    [option: string]: number | boolean
  }
}

export type AppConfig = DeepReadonly<AppConfigMutable>

export interface AppConfigMutable {
  readonly version: number,

  /** activate app, won't affect triple-ctrl setting */
  active: boolean

  /** use animation for transition */
  animation: boolean

  /** language code for locales */
  langCode: string

  /** panel width */
  panelWidth: number

  /** panel max height, 0 < n < 1 */
  panelMaxHeightRatio: number

  /** panel font-size */
  fontSize: number

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
      readonly [id in DictID]: DictConfigMutable
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

    animation: true,

    langCode,

    panelWidth: 450,

    panelMaxHeightRatio: 0.8,

    fontSize: 12,

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
      all: cloneDeep(allDicts)
    },
    contextMenus: {
      selected: ['oxford', 'google_translate', 'merriam_webster', 'cambridge', 'google_search', 'google_page_translate', 'youdao_page_translate'],
      all: cloneDeep(allContextMenus)
    }
  }
}
