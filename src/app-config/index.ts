import { DeepReadonly } from '@/typings/helpers'
import { getALlDicts } from './dicts'
import { getAllContextMenus } from './context-menus'
import { genUniqueKey } from '@/_helpers/uniqueKey'

export type LangCode = 'zh-CN' | 'zh-TW' | 'en'

const langUI = (browser.i18n.getUILanguage() || 'en')
const langCode: LangCode = /^zh-CN|zh-TW|en$/.test(langUI)
  ? langUI === 'zh-HK'
    ? 'zh-TW'
    : langUI as LangCode
  : 'en'

export type DictConfigsMutable = ReturnType<typeof getALlDicts>
export type DictConfigs = DeepReadonly<DictConfigsMutable>
export type DictID = keyof DictConfigsMutable

export type ContextMenuDictID = keyof ReturnType<typeof getAllContextMenus>

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

export type MtaAutoUnfold = '' | 'once' | 'always' | 'popup'

export type AppConfig = DeepReadonly<AppConfigMutable>

export interface AppConfigMutable {
  readonly version: number
  readonly id: string

  /** name of the config mode */
  name: string

  /** activate app, won't affect triple-ctrl setting */
  active: boolean

  /** disable selection on type fields, like input and textarea */
  noTypeField: boolean

  /** use animation for transition */
  animation: boolean

  /** language code for locales */
  langCode: LangCode

  /** panel width */
  panelWidth: number

  /** panel max height, 0 < n < 1 */
  panelMaxHeightRatio: number

  /** panel font-size */
  fontSize: number

  /** sniff pdf request */
  pdfSniff: boolean
  /** URLs, [regexp.source, match_pattern] */
  pdfWhitelist: Array<[string, string]>
  /** URLs, [regexp.source, match_pattern] */
  pdfBlacklist: Array<[string, string]>

  /** track search history */
  searhHistory: boolean
  /** incognito mode */
  searhHistoryInco: boolean

  /** open word editor when adding a word to notebook */
  editOnFav: boolean

  /** auto unfold multiline textarea search box */
  mtaAutoUnfold: MtaAutoUnfold

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
    /** cursor instant capture */
    instant: {
      enable: boolean
      key: 'direct' | 'ctrl' | 'alt'
      delay: number
    }
  },

  /** when and how to search text if the panel is pinned */
  pinMode: {
    /** direct: on mouseup */
    direct: boolean
    /** double: double click */
    double: boolean
    /** ctrl: search when double click ctrl + selection not empty */
    ctrl: boolean
    /** cursor instant capture */
    instant: {
      enable: boolean
      key: 'direct' | 'ctrl' | 'alt'
      delay: number
    }
  },

  /** when and how to search text inside dict panel */
  panelMode: {
    /** direct: on mouseup */
    direct: boolean
    /** double: double click */
    double: boolean
    /** ctrl: search when double click ctrl + selection not empty */
    ctrl: boolean
    /** cursor instant capture */
    instant: {
      enable: boolean
      key: 'direct' | 'ctrl' | 'alt'
      delay: number
    }
  },

  /** when this is a quick search standalone panel running */
  qsPanelMode: {
    /** direct: on mouseup */
    direct: boolean
    /** double: double click */
    double: boolean
    /** ctrl: search when double click ctrl + selection not empty */
    ctrl: boolean
    /** cursor instant capture */
    instant: {
      enable: boolean
      key: 'direct' | 'ctrl' | 'alt'
      delay: number
    }
  },

  /** instant capture delay, in ms */
  insCapDelay: number

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

  /** should panel be in a standalone window */
  tripleCtrlStandalone: boolean

  /** standalone panel height */
  tripleCtrlHeight: number

  /** should standalone panel response to page selection */
  tripleCtrlPageSel: boolean

  /** browser action preload source */
  baPreload: PreloadSource

  /** auto search when browser action triggered */
  baAuto: boolean

  /** start searching when source containing the languages */
  language: {
    chinese: boolean
    english: boolean
    minor: boolean
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

  /** URLs, [regexp.source, match_pattern] */
  whitelist: Array<[string, string]>
  /** URLs, [regexp.source, match_pattern] */
  blacklist: Array<[string, string]>

  dicts: {
    /** default selected dictionaries */
    selected: DictID[]
    // settings of each dict will be auto-generated
    readonly all: DictConfigsMutable
  }
  contextMenus: {
    selected: ContextMenuDictID[]
    readonly all: {
      readonly [id in ContextMenuDictID]: string
    }
  }
}

export default appConfigFactory

export function appConfigFactory (id?: string): AppConfig {
  return {
    version: 9,
    id: id || genUniqueKey(),

    name: `%%_default_%%`,

    active: true,

    noTypeField: false,

    animation: true,

    langCode,

    panelWidth: 450,

    panelMaxHeightRatio: 0.8,

    fontSize: 13,

    pdfSniff: true,
    pdfWhitelist: [],
    pdfBlacklist: [
      ['^(http|https)://[^/]*?cnki\.net(/.*)?$', '*://*.cnki.net/*'],
    ],

    searhHistory: false,
    searhHistoryInco: false,

    newWordSound: true,

    editOnFav: true,

    mtaAutoUnfold: '',

    mode: {
      icon: true,
      direct: false,
      double: false,
      ctrl: false,
      instant: {
        enable: false,
        key: 'alt',
        delay: 600,
      },
    },

    pinMode: {
      direct: true,
      double: false,
      ctrl: false,
      instant: {
        enable: false,
        key: 'alt',
        delay: 600,
      },
    },

    panelMode: {
      direct: false,
      double: false,
      ctrl: false,
      instant: {
        enable: false,
        key: 'alt',
        delay: 600,
      },
    },

    qsPanelMode: {
      direct: false,
      double: false,
      ctrl: true,
      instant: {
        enable: false,
        key: 'alt',
        delay: 600,
      },
    },

    insCapDelay: 600,
    doubleClickDelay: 450,

    tripleCtrl: true,

    tripleCtrlPreload: 'clipboard' as PreloadSource,

    tripleCtrlAuto: false,

    tripleCtrlLocation: TCDirection.center,

    tripleCtrlStandalone: true,
    tripleCtrlHeight: 600,
    tripleCtrlPageSel: true,

    baPreload: 'clipboard' as PreloadSource,

    baAuto: false,

    language: {
      chinese: true,
      english: true,
      minor: true,
    },

    autopron: {
      cn: {
        dict: '',
        list: ['zdic', 'guoyu']
      },
      en: {
        dict: '',
        list: [
          'bing',
          'cambridge',
          'cobuild',
          'eudic',
          'longman',
          'macmillan',
          'oald',
          'urban',
          'websterlearner',
          'youdao',
        ],
        accent: 'uk' as ('us' | 'uk')
      }
    },

    whitelist: [],
    blacklist: [],

    dicts: {
      selected: ['bing', 'cambridge', 'youdao', 'urban', 'vocabulary', 'google', 'sogou', 'zdic', 'guoyu', 'liangan', 'googledict'],
      // settings of each dict will be auto-generated
      all: getALlDicts()
    },
    contextMenus: {
      selected: ['google_translate', 'google_search', 'google_page_translate', 'youdao_page_translate'],
      all: getAllContextMenus()
    }
  }
}
