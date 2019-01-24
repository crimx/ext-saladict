import { DeepReadonly } from '@/typings/helpers'
import { getALlDicts } from './dicts'
import { getAllContextMenus } from './context-menus'
import { MtaAutoUnfold as _MtaAutoUnfold, _getDefaultProfile } from './profiles'

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
export type MtaAutoUnfold = _MtaAutoUnfold

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

export type InstantSearchKey = 'direct' | 'ctrl' | 'alt' | 'shift'

/** '' means no preload */
export type PreloadSource = '' | 'clipboard' | 'selection'

export type AllDicts = ReturnType<typeof getALlDicts>

export type AppConfigMutable = ReturnType<typeof _getDefaultConfig>
export type AppConfig = DeepReadonly<AppConfigMutable>

export const getDefaultConfig: () => AppConfig = _getDefaultConfig
export default getDefaultConfig

function _getDefaultConfig () {
  return {
    version: 12,

    /** activate app, won't affect triple-ctrl setting */
    active: true,

    /** disable selection on type fields, like input and textarea */
    noTypeField: false,

    /** use animation for transition */
    animation: true,

    /** language code for locales */
    langCode,

    /** panel width */
    panelWidth: 450,

    /** panel max height in percentage, 0 < n < 100 */
    panelMaxHeightRatio: 80,

    /** panel font-size */
    fontSize: 13,

    /** sniff pdf request */
    pdfSniff: true,
    /** URLs, [regexp.source, match_pattern] */
    pdfWhitelist: [] as [string, string][],
    /** URLs, [regexp.source, match_pattern] */
    // tslint:disable-next-line: no-unnecessary-type-assertion
    pdfBlacklist: [
      ['^(http|https)://[^/]*?cnki\.net(/.*)?$', '*://*.cnki.net/*'],
    ] as [string, string][],

    /** track search history */
    searhHistory: false,
    /** incognito mode */
    searhHistoryInco: false,

    /** open word editor when adding a word to notebook */
    editOnFav: true,

    /** Show suggestions when typing on search box */
    searchSuggests: true,

    /** when and how to search text */
    mode: {
      /** show pop icon first */
      icon: true,
      /** how panel directly */
      direct: false,
      /** double click */
      double: false,
      /** holding a key */
      holding: {
        shift: false,
        ctrl: false,
        meta: false,
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600,
      },
    },

    /** when and how to search text if the panel is pinned */
    pinMode: {
      /** direct: on mouseup */
      direct: true,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        shift: false,
        ctrl: false,
        meta: false,
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600,
      },
    },

    /** when and how to search text inside dict panel */
    panelMode: {
      /** direct: on mouseup */
      direct: false,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        shift: false,
        ctrl: false,
        meta: false,
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600,
      },
    },

    /** when this is a quick search standalone panel running */
    qsPanelMode: {
      /** direct: on mouseup */
      direct: false,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        shift: false,
        ctrl: true,
        meta: false,
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600,
      },
    },

    /** hover instead of click */
    bowlHover: true,

    /** double click delay, in ms */
    doubleClickDelay: 450,

    /** show panel when triple press ctrl */
    tripleCtrl: true,

    /** preload source */
    tripleCtrlPreload: 'clipboard' as PreloadSource,

    /** auto search when triple hit ctrl */
    tripleCtrlAuto: false,

    /** where should the dict appears */
    tripleCtrlLocation: TCDirection.center,

    /** should panel be in a standalone window */
    tripleCtrlStandalone: true,

    /** standalone panel height */
    tripleCtrlHeight: 600,

    /** should standalone panel response to page selection */
    tripleCtrlPageSel: true,

    /** browser action preload source */
    baPreload: 'clipboard' as PreloadSource,

    /** auto search when browser action triggered */
    baAuto: false,

    /** context tranlate engines */
    ctxTrans: {
      google: true,
      sogou: true,
    } as { [id in DictID]: boolean },

    /** start searching when source containing the languages */
    language: {
      chinese: true,
      english: true,
      minor: true,
    },

    /** auto pronunciation */
    autopron: {
      cn: {
        dict: '' as DictID | '',
        list: ['zdic', 'guoyu'] as DictID[]
      },
      en: {
        dict: '' as DictID | '',
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
        ] as DictID[],
        accent: 'uk' as 'us' | 'uk'
      }
    },

    /** URLs, [regexp.source, match_pattern] */
    whitelist: [] as [string, string][],
    /** URLs, [regexp.source, match_pattern] */
    // tslint:disable-next-line: no-unnecessary-type-assertion
    blacklist: [
      ['^https://stackedit\.io(/.*)?$', 'https://stackedit.io/*']
    ] as [string, string][],

    contextMenus: {
      selected: [
        'view_as_pdf',
        'google_translate',
        'google_search',
        'google_page_translate',
        'youdao_page_translate'
      ],
      all: getAllContextMenus()
    }
  }
}
