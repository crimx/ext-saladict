import { DeepReadonly } from '@/typings/helpers'
import { SupportedLangs } from '@/_helpers/lang-check'
import { getAllDicts } from './dicts'
import { getAllContextMenus } from './context-menus'
import { MtaAutoUnfold as _MtaAutoUnfold } from './profiles'
import { getDefaultDictAuths } from './auth'
import { isFirefox } from '@/_helpers/saladict'

export type LangCode = 'zh-CN' | 'zh-TW' | 'en'

const langUI = browser.i18n.getUILanguage()
const langCode: LangCode =
  langUI === 'zh-CN'
    ? 'zh-CN'
    : langUI === 'zh-TW' || langUI === 'zh-HK'
    ? 'zh-TW'
    : 'en'

export type DictConfigsMutable = ReturnType<typeof getAllDicts>
export type DictConfigs = DeepReadonly<DictConfigsMutable>
export type DictID = keyof DictConfigsMutable
export type MtaAutoUnfold = _MtaAutoUnfold

export type TCDirection =
  | 'CENTER'
  | 'TOP'
  | 'RIGHT'
  | 'BOTTOM'
  | 'LEFT'
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_RIGHT'

export type InstantSearchKey = 'direct' | 'ctrl' | 'alt' | 'shift'

/** '' means no preload */
export type PreloadSource = '' | 'clipboard' | 'selection'

export type AllDicts = ReturnType<typeof getAllDicts>

export type AppConfigMutable = ReturnType<typeof _getDefaultConfig>
export type AppConfig = DeepReadonly<AppConfigMutable>

export const getDefaultConfig: () => AppConfig = _getDefaultConfig
export default getDefaultConfig

function _getDefaultConfig() {
  return {
    version: 14,

    /** activate app, won't affect triple-ctrl setting */
    active: true,

    /** Run extension in background */
    runInBg: false,

    /** enable Google analytics */
    analytics: true,

    /** enable update check */
    updateCheck: true,

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

    bowlOffsetX: 15,

    bowlOffsetY: -45,

    darkMode: false,

    /** custom panel css */
    panelCSS: '',

    /** panel font-size */
    fontSize: 13,

    /** sniff pdf request */
    pdfSniff: false,
    /**
     * Open PDF viewer in standalone panel.
     * 'manual': do not redirect on web requests
     */
    pdfStandalone: '' as '' | 'always' | 'manual',
    /** URLs, [regexp.source, match_pattern] */
    pdfWhitelist: [] as [string, string][],
    /** URLs, [regexp.source, match_pattern] */
    // tslint:disable-next-line: no-unnecessary-type-assertion
    pdfBlacklist: [
      ['^(http|https)://[^/]*?cnki\\.net(/.*)?$', '*://*.cnki.net/*'],
      [
        '^(http|https)://[^/]*?googleusercontent\\.com(/.*)?$',
        '*://*.googleusercontent.com/*'
      ],
      [
        '^(http|https)://sh-download\\.weiyun\\.com(/.*)?$',
        '*://sh-download.weiyun.com/*'
      ]
    ] as [string, string][],

    /** track search history */
    searchHistory: false,
    /** incognito mode */
    searchHistoryInco: false,

    /** open word editor when adding a word to notebook */
    editOnFav: true,

    /** Show suggestions when typing on search box */
    searchSuggests: true,

    /** Enable touch related support */
    touchMode: false,

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
        alt: false,
        shift: false,
        ctrl: false,
        meta: false
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600
      }
    },

    /** when and how to search text if the panel is pinned */
    pinMode: {
      /** direct: on mouseup */
      direct: true,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        alt: false,
        shift: false,
        ctrl: false,
        meta: false
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600
      }
    },

    /** when and how to search text inside dict panel */
    panelMode: {
      /** direct: on mouseup */
      direct: false,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        alt: false,
        shift: false,
        ctrl: false,
        meta: false
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600
      }
    },

    /** when this is a quick search standalone panel running */
    qsPanelMode: {
      /** direct: on mouseup */
      direct: true,
      /** double: double click */
      double: false,
      /** holding a key */
      holding: {
        alt: false,
        shift: false,
        ctrl: true,
        meta: false
      },
      /** cursor instant capture */
      instant: {
        enable: false,
        key: 'alt' as InstantSearchKey,
        delay: 600
      }
    },

    /** hover instead of click */
    bowlHover: true,

    /** double click delay, in ms */
    doubleClickDelay: 450,

    /** show quick search panel when triple press ctrl */
    tripleCtrl: true,

    /** preload content on quick search panel */
    qsPreload: 'selection' as PreloadSource,

    /** auto search when quick search panel opens */
    qsAuto: false,

    /** where should the dict appears */
    qsLocation: 'CENTER' as TCDirection,

    /** focus quick search panel when shows up */
    qsFocus: true,

    /** should panel be in a standalone window */
    qsStandalone: true,

    /** standalone panel height */
    qssaHeight: 600,

    /** resize main widnow to leave space to standalone window */
    qssaSidebar: '' as '' | 'left' | 'right',

    /** should standalone panel response to page selection */
    qssaPageSel: true,

    /** should standalone panel memo position and dimension on close */
    qssaRectMemo: false,

    /** browser action panel width defaults to as wide as possible */
    baWidth: -1,

    baHeight: 550,

    /** browser action panel preload source */
    baPreload: 'selection' as PreloadSource,

    /** auto search when browser action panel shows */
    baAuto: false,

    /**
     * browser action behavior
     * 'popup_panel' - show dict panel
     * 'popup_fav' - add selection to notebook
     * 'popup_options' - opten options
     * 'popup_standalone' - open standalone panel
     * others are same as context menus
     */
    baOpen: 'popup_panel',

    /** context tranlate engines */
    ctxTrans: {
      google: true,
      youdaotrans: true,
      baidu: true,
      tencent: false,
      caiyun: false,
      sogou: false
    },

    /** start searching when source containing the languages */
    language: {
      chinese: true,
      english: true,
      japanese: true,
      korean: true,
      french: true,
      spanish: true,
      deutsch: true,
      others: false,
      matchAll: false
    } as SupportedLangs,

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
          'lexico',
          'urban',
          'websterlearner',
          'youdao'
        ] as DictID[],
        accent: 'uk' as 'us' | 'uk'
      },
      machine: {
        dict: '' as DictID | '',
        list: ['google', 'sogou', 'tencent', 'baidu', 'caiyun'],
        // play translation or source
        src: 'trans' as 'trans' | 'searchText'
      }
    },

    /** URLs, [regexp.source, match_pattern] */
    whitelist: [] as [string, string][],
    /** URLs, [regexp.source, match_pattern] */
    // tslint:disable-next-line: no-unnecessary-type-assertion
    blacklist: [
      ['^https://stackedit\\.io(/.*)?$', 'https://stackedit.io/*'],
      ['^https://docs\\.google\\.com(/.*)?$', 'https://docs.google.com/*'],
      ['^https://docs\\.qq\\.com(/.*)?$', 'https://docs.qq.com/*']
    ] as [string, string][],

    contextMenus: {
      selected:
        isFirefox || !langCode.startsWith('zh-')
          ? ['view_as_pdf', 'google_translate', 'saladict']
          : ['view_as_pdf', 'caiyuntrs', 'google_translate', 'saladict'],
      all: getAllContextMenus()
    },

    /** Open settings on first switching "translation" profile */
    showedDictAuth: false,
    dictAuth: getDefaultDictAuths()
  }
}
