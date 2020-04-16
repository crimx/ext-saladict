import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: 'Saladict Options',
  previewPanel: 'Preview Dict Panel',

  config: {
    active: 'Enable Inline Translator',
    active_help:
      '"Quick Search" is still available even if Inline translation is turned off.',
    animation: 'Animation transitions',
    animation_help: 'Switch off animation transitions to reduce runtime cost.',
    darkMode: 'Dark Mode',
    langCode: 'App Language',
    editOnFav: 'Open WordEditor when saving',
    editOnFav_help:
      'When turned off, new words will be added to notebook directly.',
    searchHistory: 'Keep search history',
    searchHistory_help:
      'Search histry might unintentionally reveal your browsing history.',
    searchHistoryInco: 'Also in incognito mode',
    ctxTrans: 'Context Translate Engines',
    ctxTrans_help:
      'Context sentence will be translated before being added to notebook.',
    searchSuggests: 'Search suggests',
    panelMaxHeightRatio: 'Panel max height ratio',
    panelWidth: 'Panel width',
    fontSize: 'Font size for search reasults',
    bowlOffsetX: 'Saladict icon Offset X',
    bowlOffsetY: 'Saladict icon Offset Y',
    panelCSS: 'Custom Dict Panel Styles',
    panelCSS_help:
      'Custom CSS. For Dict Panel use .dictPanel-Root as root. For dictionaries use .dictRoot or .d-{id} as root',
    noTypeField: 'No selection on editable regions',
    noTypeField_help:
      'If selection making in editable regions is banned, the extension will identify Input Boxes, TextAreas and other common text editors like CodeMirror, ACE and Monaco.',
    touchMode: 'Touch Mode',
    touchMode_help: 'Enable touch related selection',
    language: 'Selection Languages',
    language_help:
      'Search when selection contains words in the chosen languages.',
    language_extra:
      'Note that Japanese and Korean also include Chinese. French, Deutsch and Spanish also include English. If Chinese or English is cancelled while others are selected, only the exclusive parts of those languages are tested. E.g. kana characters in Japanese.',
    doubleClickDelay: 'Double Click Delay',
    mode: 'Normal Selection',
    panelMode: 'Inside Dict Panel',
    pinMode: 'When Panel Is Pinned',
    qsPanelMode: 'Page Selection',
    bowlHover: 'Icon Mouse Hover',
    bowlHover_help:
      'Hover on the bowl icon to trigger searching instead of clicking.',

    opt: {
      export: 'Export Configs',
      help: 'Configs are synced automatically via browser.',
      import: 'Import Configs',
      import_error: 'Import Configs failed',
      reset: 'Reset Configs',
      reset_confirm: 'Reset to default settings. Confirm？',
      upload_error: 'Unable to save settings.'
    }
  },

  searchMode: {
    icon: 'Show Icon',
    icon_help: 'A cute little icon pops up nearby the cursor.',
    direct: 'Direct Search',
    direct_help: 'Show dict panel directly.',
    double: 'Double Click',
    double_help: 'Show dict panel after double click selection.',
    holding: 'Hold a key',
    holding_help:
      'After a selection is made, the selected key must be pressing when releasing mouse (Meta key is "⌘ Command" on macOS and "⊞ Windows" for others).',
    instant: 'Instant Capture',
    instant_help: 'Selection is automatically made near by the cursor.',
    instantDirect: 'Direct',
    instantKey: 'Key',
    instantKey_help:
      'If "Direct" is chosen it is also recommeded setting browser shortkey to toggle Instant Capture. Otherwise browser text selection could be unable to perform.',
    instantDelay: 'Capture delay'
  },

  profiles: {
    opt: {
      add_name: 'Add Profile Name',
      delete_confirm: 'Delete Profile "{{name}}". Confirm?',
      edit_name: 'Change Profile Name',
      help:
        'Each profile represents an independent set of settings. Some of the settings (with {*} prefix) change according to profile. One may switch profiles by hovering on the menu icon on Dict Panel, or focus on the icon then hit {↓}.'
    }
  },

  profile: {
    mtaAutoUnfold: 'Auto unfold multiline search box',
    waveform: 'Waveform Control',
    waveform_help:
      'Display a button at the bottom of the Dict Panel for expanding the Waveform Control Panel. Audio files can still be played if turned off.',

    opt: {
      item_extra: 'This option may change base on "Profile".',
      mtaAutoUnfold: {
        always: 'Keep Unfolding',
        never: 'Never Unfold',
        once: 'Unfold Once',
        popup: 'Only On Browser Action'
      }
    }
  },

  syncService: {
    description: 'Sync settings.',
    start: 'Syncing started in background',
    success: 'Syncing success',
    failed: 'Syncing failed',
    close_confirm: 'Settings not saved. Close?',
    delete_confirm: 'Delete?',
    error_url: 'Not a valid url.',

    btn: {
      shanbay: 'Shanbay Sync Service',
      webdav: 'WebDAV Sync Service'
    },

    shanbay: {
      title: 'Shanbay Sync',
      description:
        "Go to shanbay.com and log in first(must stay logged in). Note that it's a one-way sync(from Saladict to Shanbay). Only the new added words are synced. Words also need to be supported by Shanbay's database.",
      login:
        'Will open shanbay.com. Please log in then come back and enable again.',
      sync_all: 'Upload all existing new words',
      sync_all_confirm:
        'Too many new words in notebook. Saladict will upload in batches. Note that uploading too many words in short period would cause account banning which is unrecoverable. Confirm?',
      sync_last: 'Upload the last new word'
    },

    webdav: {
      title: 'WebDAV Sync',
      description:
        'Extension settings (including this) are synced via browser. New words notebook can be synced via WebDAV through settings here.',
      jianguo: 'See Jianguoyun for example',
      checking: 'Connecting...',
      duration: 'Duration',
      duration_help:
        'Data is guaranteed to be updated before upload. If you do not need real-time syncing across browsers, set a longer polling cycle to reduce CPU and memory footprint.',
      err_exist:
        'Files under Saladict directory on server will be overwritten. Download and merge with local files first?',
      err_mkcol:
        'Cannot create "Saladict" directory on server. Please create the directory manualy on server.',
      err_network: 'Network error. Cannot connect to server.',
      err_parse: 'Incorrect response XML from server.',
      err_unauthorized: 'Incorrect account or password.',
      err_unknown: 'Unknown error 「{{error}}」.',
      passwd: 'Password',
      url: 'Server Address',
      user: 'User Account'
    }
  },

  shortcuts: 'Set Shortcuts',
  msg_update_error: 'Unable to update',
  msg_updated: 'Successfully updated',
  unsave_confirm: 'Settings not saved. Sure to leave?',

  headInfo: {
    acknowledgement: {
      title: 'Acknowledgement',
      naver: 'for helping add Naver dict',
      shanbay: 'for adding Shanbay dict',
      trans_tw: 'for traditional Chinese translation',
      weblio: 'for helping add Weblio dict'
    },
    contact_author: 'Contact Author',
    donate: 'Donate',
    instructions: 'Instructions',
    report_issue: 'Report Issue'
  },

  dict: {
    add: 'Add dicts',
    default_height: 'Default Panel Height',
    default_height_help:
      'Maximum height on first appearance. Contents exceeding this height will be hidden.',
    default_unfold: 'Default Unfold',
    default_unfold_help:
      "If turned off, this dictionary won't start searching unless it's title bar is clicked.",
    lang: {
      de: 'De',
      en: 'En',
      es: 'Es',
      fr: 'Fr',
      ja: 'Ja',
      kor: 'Kor',
      zhs: 'Zhs',
      zht: 'Zht'
    },

    more_options: 'More Options',
    sel_lang: 'Selection Languages',
    sel_lang_help:
      'Show this dictionary when selection contains words in the chosen languages.',
    sel_word_count: 'Selection Word Count',
    sel_word_count_help:
      'Show this dictionary when selection word count meets the requirements.'
  },

  match_pattern_description:
    'Specify URLs as match patterns. <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns#Examples" target="_blank">Examples</a>. Empty fields will be removed.',

  nav: {
    BlackWhiteList: 'Black/White List',
    ContextMenus: 'Context Menus',
    Dictionaries: 'Dictionaries',
    DictPanel: 'Dict Panel',
    General: 'General',
    ImportExport: 'Import/Export',
    Notebook: 'Notebook',
    PDF: 'PDF',
    Popup: 'Popup Panel',
    Profiles: 'Profiles',
    QuickSearch: 'Quick Search',
    SearchModes: 'Search Modes',
    Privacy: 'Privacy'
  },

  opt: {
    analytics: 'Enable Google Analytics',
    analytics_help:
      'Share anonymous device browser version information. Saladict author will offer prioritized support to popular devices and browsers.',
    autopron: {
      accent: 'Accent Preference',
      accent_uk: 'UK',
      accent_us: 'US',
      cn: 'Chinese Auto-Pronounce',
      en: 'English Auto-Pronounce',
      machine: 'Machine Auto-Pronounce',
      machine_src: 'Machine Pronounce',
      machine_src_help:
        'Machine Translation Dictionary needs to be added and enabled on the list below to enable auto-pronunciation.',
      machine_src_search: 'Read Source Text',
      machine_src_trans: 'Read Translation Text'
    },
    browserAction: {
      open: 'Browser Action',
      openDictPanel: 'Dict Panel',
      openFav: 'Add to Notebook',
      openHelp:
        'When clicking the browser action icon in toolbar (next to the address bar). Items are same as Context Menus, which can be added or edited on the Context Menus config page.',
      openOptions: 'Open Saladict Options',
      openStandalone: 'Open Saladict Standalone Panel'
    },

    context_description:
      'Each context menus item can also be customized. Youdao and Google page translate are deprecated in favor of the official extensions.',
    context_menus_title: 'Add Context Menus Items',
    context_menus_add_rules: 'URL with %s in place of query.',

    dict_selected: 'Selected Dicts',

    pdf_blackwhitelist_help:
      'Blacklisted PDF links will not jump to Saladict PDF Viewer.',
    pdf_sniff: 'Enable PDF Sniffer',
    pdf_sniff_help: 'If turned on， PDF links will be automatically captured.',
    third_party_privacy: 'Third Party Privacy',
    third_party_privacy_help:
      'Saladict will not collect further information but search text and releated cookies will be sent to third party dictionary services(just like how you would search on their websites). If you do not want third party services to collect you data, remove the dictionaries at "Dictionaries" settings.',
    third_party_privacy_extra:
      'Cannot be turned off as it is the core functionality of Saladict.',
    profile_change: 'This option may change base on "Profile".',
    quick_search: 'Enable',

    sel_blackwhitelist: 'Selection Black/White List',
    sel_blackwhitelist_help:
      'Saladict will not react to selection in blacklisted pages.',

    update_check: 'Check Update',
    update_check_help: 'Automatically check update from Github'
  },

  quickSearch: {
    height: 'Window Height',
    help:
      'Press <kbd>⌘ Command</kbd>(macOS) or <kbd>Ctrl</kbd>(Others) three times (or with browser shortkey) to summon the dictionary panel. ',
    loc: 'Location',
    page_sel: 'Selection Response',
    page_sel_help: 'Response to page selection.',
    sidebar: 'Sidebar Layout',
    sidebar_help: 'Rearrange windows to sidebar-like layout.',
    standalone: 'Standalone',
    standalone_help:
      'Render dict panel in a standalone window (See <a href="https://saladict.crimx.com/manual.html#shortcuts" target="_blank">here</a> on how to work with text selection outside browser).',
    locations: {
      CENTER: 'Center',
      TOP: 'Top',
      RIGHT: 'Right',
      BOTTOM: 'Bottom',
      LEFT: 'Left',
      TOP_LEFT: 'Top Left',
      TOP_RIGHT: 'Top Right',
      BOTTOM_LEFT: 'Bottom Left',
      BOTTOM_RIGHT: 'Bottom Right'
    }
  },

  preload: {
    title: 'Preload',
    auto: 'Auto search',
    auto_help: 'Search automatically when panel shows up.',
    clipboard: 'Clipboard',
    help: 'Preload content in search box when panel shows up.',
    selection: 'Page Selection'
  }
}
