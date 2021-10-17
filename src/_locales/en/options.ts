import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: 'Saladict Options',
  previewPanel: 'Preview Dict Panel',
  shortcuts: 'Set Shortcuts',
  msg_update_error: 'Unable to update',
  msg_updated: 'Successfully updated',
  msg_first_time_notice: 'First time notice',
  msg_err_permission: 'Unable to request "{{permission}}" permission.',
  unsave_confirm: 'Settings not saved. Sure to leave?',
  nativeSearch: 'search selected text outside of browser',
  firefox_shortcuts:
    'Open about:addons, click the top right "gear" button, choose the last "Manage extension shortcuts".',
  tutorial: 'Tutorial',
  page_selection: 'Page Selection',

  nav: {
    General: 'General',
    Notebook: 'Notebook',
    Profiles: 'Profiles',
    DictPanel: 'Dict Panel',
    SearchModes: 'Search Modes',
    Dictionaries: 'Dictionaries',
    DictAuths: 'Access Tokens',
    Popup: 'Popup Panel',
    QuickSearch: 'Quick Search',
    Pronunciation: 'Pronunciation',
    PDF: 'PDF',
    ContextMenus: 'Context Menus',
    BlackWhiteList: 'Black/White List',
    ImportExport: 'Import/Export',
    Privacy: 'Privacy',
    Permissions: 'Permissions'
  },

  config: {
    active: 'Enable Inline Translator',
    active_help:
      '"Quick Search" is still available even if Inline translation is turned off.',
    animation: 'Animation transitions',
    animation_help: 'Switch off animation transitions to reduce runtime cost.',
    runInBg: 'Keep in Background',
    runInBg_help:
      'Keep the browser running in background after close so that global shortcuts still work.',
    darkMode: 'Dark Mode',
    langCode: 'App Language',
    editOnFav: 'Open WordEditor when saving',
    editOnFav_help:
      'When turned off, new words will be added to notebook directly.',
    searchHistory: 'Keep search history',
    searchHistory_help:
      'Your browsing history could be unintentionally revealed in Search history.',
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
    pinMode: 'When Panel is Pinned',
    qsPanelMode: 'When Standalone Panel is Opened',
    bowlHover: 'Icon Mouse Hover',
    bowlHover_help:
      'Hover on the bowl icon to trigger searching instead of clicking.',
    autopron: {
      cn: {
        dict: 'Chinese Auto-Pronounce'
      },
      en: {
        dict: 'English Auto-Pronounce',
        accent: 'Accent Preference'
      },
      machine: {
        dict: 'Machine Auto-Pronounce',
        src: 'Machine Pronounce',
        src_help:
          'Machine Translation Dictionary needs to be added and enabled on the list below to enable auto-pronunciation.',
        src_search: 'Read Source Text',
        src_trans: 'Read Translation Text'
      }
    },
    pdfSniff: 'Enable PDF Sniffer',
    pdfSniff_help: 'If turned on， PDF links will be automatically captured.',
    pdfSniff_extra:
      'It is recommended to {search selected text outside of browser} with your own favorite local reader.',
    pdfStandalone: 'Standalone Panel',
    pdfStandalone_help: 'Open PDF viewer in standalone panel.',
    baWidth: 'Width',
    baWidth_help:
      'Browser Action Panel wdith. Dict Panel width will be used if a negative value is chosen.',
    baHeight: 'Height',
    baHeight_help: 'Browser Action Panel height.',
    baOpen: 'Browser Action',
    baOpen_help:
      'When clicking the browser action icon in toolbar (next to the address bar). Items are same as Context Menus, which can be added or edited on the Context Menus config page.',
    tripleCtrl: 'Enable Ctrl Shortkey',
    tripleCtrl_help:
      'Press {⌘ Command}(macOS) or {Ctrl}(Others) three times (or with browser shortkey) to summon the dictionary panel. ',
    defaultPinned: 'Pinned when shows up',
    qsLocation: 'Location',
    qsFocus: 'Focus when shows up',
    qsStandalone: 'Standalone',
    qsStandalone_help:
      'Render dict panel in a standalone window. You can {search selected text outside of browser}.',
    qssaSidebar: 'Sidebar Layout',
    qssaSidebar_help: 'Rearrange windows to sidebar-like layout.',
    qssaHeight: 'Window Height',
    qssaPageSel: 'Selection Response',
    qssaPageSel_help: 'Response to page selection.',
    qssaRectMemo: 'Remember size and position',
    qssaRectMemo_help: 'Remember standalone panel size and position on close.',
    updateCheck: 'Check Update',
    updateCheck_help: 'Check update automatically.',
    analytics: 'Enable Google Analytics',
    analytics_help:
      'Share anonymous device browser version information. Saladict author will offer prioritized support to popular devices and browsers.',

    opt: {
      reset: 'Reset Configs',
      reset_confirm: 'Reset to default settings. Confirm？',
      upload_error: 'Unable to save settings.',
      accent: {
        uk: 'UK',
        us: 'US'
      },
      sel_blackwhitelist: 'Selection Black/White List',
      sel_blackwhitelist_help:
        'Saladict will not react to selection in blacklisted pages.',
      pdf_blackwhitelist_help:
        'Blacklisted PDF links will not jump to Saladict PDF Viewer.',
      contextMenus_description:
        'Each context menus item can also be customized. Youdao and Google page translate are deprecated in favor of the official extensions.',
      contextMenus_edit: 'Edit Context Menus Items',
      contextMenus_url_rules: 'URL with %s in place of query.',
      baOpen: {
        popup_panel: 'Dict Panel',
        popup_fav: 'Add to Notebook',
        popup_options: 'Open Saladict Options',
        popup_standalone: 'Open Saladict Standalone Panel'
      },
      openQsStandalone: 'Standalone Panel Options',
      pdfStandalone: {
        default: 'Never',
        always: 'Always',
        manual: 'Manual'
      }
    }
  },

  matchPattern: {
    description:
      'Specify URL as {URL Match Pattern} or {Regular Expression}. Empty fields will be removed.',
    url: 'URL Match Pattern',
    url_error: 'Incorrect URL Match Pattern.',
    regex: 'Regular Expression',
    regex_error: 'Incorrect Regular Expression.'
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
      'After a selection is made, the selected key must be pressing when releasing mouse (Alt is "⌥ Option" on macOS. Meta key is "⌘ Command" on macOS and "⊞ Windows" for others.).',
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
      'Display a button at the bottom of the Dict Panel for expanding the Waveform Control Panel which is only loaded after expansion.',
    stickyFold: 'Sticky Folding',
    stickyFold_help:
      'Remembers manual dictionary folding/unfolding states when searching. Only last on the same page.',

    opt: {
      item_extra: 'This option may change base on "Profile".',
      mtaAutoUnfold: {
        always: 'Keep Unfolding',
        never: 'Never Unfold',
        once: 'Unfold Once',
        popup: 'Only On Browser Action',
        hide: 'Hide'
      },
      dict_selected: 'Selected Dicts'
    }
  },

  dict: {
    add: 'Add dicts',
    more_options: 'More Options',

    selectionLang: 'Selection Languages',
    selectionLang_help:
      'Show this dictionary when selection contains words in the chosen languages.',
    defaultUnfold: 'Default Unfold',
    defaultUnfold_help:
      "If turned off, this dictionary won't start searching unless it's title bar is clicked.",
    selectionWC: 'Selection Word Count',
    selectionWC_help:
      'Show this dictionary when selection word count meets the requirements. Set 999999 for unlimited words.',
    preferredHeight: 'Default Panel Height',
    preferredHeight_help:
      'Maximum height on first appearance. Contents exceeding this height will be hidden. Set 999999 for unlimited height.',

    lang: {
      de: 'De',
      en: 'En',
      es: 'Es',
      fr: 'Fr',
      ja: 'Ja',
      kor: 'Kor',
      zhs: 'Zhs',
      zht: 'Zht'
    }
  },

  syncService: {
    description: 'Sync settings.',
    start: 'Syncing. Do not close this page until finished.',
    finished: 'Syncing finished',
    success: 'Syncing success',
    failed: 'Syncing failed',
    close_confirm: 'Settings not saved. Close?',
    delete_confirm: 'Delete?',

    shanbay: {
      description:
        "Go to shanbay.com and log in first(must stay logged in). Note that it's a one-way sync(from Saladict to Shanbay). Only the new added words are synced. Words also need to be supported by Shanbay's database.",
      login:
        'Will open shanbay.com. Please log in then come back and enable again.',
      sync_all: 'Upload all existing new words',
      sync_all_confirm:
        'Too many new words in notebook. Saladict will upload in batches. Note that uploading too many words in short period would cause account banning which is unrecoverable. Confirm?',
      sync_last: 'Upload the last new word'
    },

    eudic: {
      description:
        'Before using Eudic to synchronize words, you must first create a default new word book on Eudic official website (my.eudic.net/home/index) (generally, it will be automatically generated and cannot be deleted after the first manual import). Pay attention not to synchronize frequently in a short time, which may cause temporary lock.',
      token: 'Authorization information',
      getToken: 'Get authorization',
      verify: 'Check authorization information',
      verified: 'Eudic authorization information checked successfully',
      enable_help:
        'After opening, each new word added will be automatically synchronized to the Eudic default word book (salad to Eudic word book) in one direction, and only the new word itself will be synchronized (deleted out of synchronization)',
      token_help:
        'Please confirm to set valid personal authorization information, otherwise the synchronization will fail. You can click the button at the bottom to check.',
      sync_all: 'Synchronize all new words',
      sync_help:
        'Synchronize all existing new words in salad word book to the Eudic default word book (turn on the synchronization switch above at the same time and click save)',
      sync_all_confirm:
        'Note that frequent synchronization in a short time may lead to lock temporarily. Are you sure to continue?'
    },

    webdav: {
      description:
        'Extension settings (including this) are synced via browser. New words notebook can be synced via WebDAV through settings here.',
      jianguo: 'See Jianguoyun for example',
      checking: 'Connecting...',
      exist_confirm:
        'Saladict directory exists on server. Download it and merge with local data?',
      upload_confirm: 'Upload local data to Server right away?',
      verify: 'Verify server',
      verified: 'Successfully verified WebDAV server.',
      duration: 'Duration',
      duration_help:
        'Data is guaranteed to be updated before upload. If you do not need real-time syncing across browsers, set a longer polling cycle to reduce CPU and memory footprint.',
      passwd: 'Password',
      url: 'Server Address',
      user: 'User Account'
    },

    ankiconnect: {
      description:
        'Please make sure Anki Connect plugin is installed and Anki is running. You can also update word to Anki in Word Editor.',
      checking: 'Checking...',
      deck_confirm:
        'Deck "{{deck}}" does not exist in Anki. Generate a new deck?',
      deck_error: 'Unable to create deck "{{deck}}".',
      notetype_confirm:
        'Note type "{{noteType}}" does not exist in Anki. Generate a new note type.',
      notetype_error: 'Unable to create note type "{{noteType}}".',
      upload_confirm:
        'Sync local new words to Anki right away? Duplicated words (with same timestamp) will be skipped.',
      add_yourself: 'Please add it youself in Anki.',
      verify: 'Verify Anki Connect',
      verified: 'Successfully verified Anki Connect',
      enable_help:
        'When enabled, each time a new word is added to Notebook it will also be ported to Anki automatically. Words that exist in Anki(with same "Date") can be force-updated in Word Editor.',
      host: 'Address',
      port: 'port',
      key: 'Key',
      key_help:
        'Optional key can be added in Anki Connect config for identification.',
      deckName: 'Deck',
      deckName_help:
        'If deck does not exist you can generate a default one automatically by clicking "Verify Anki Connect" below.',
      noteType: 'Note Type',
      noteType_help:
        'Anki note type includes a set of fields and card type. If note type does not exist you can generate a default one automatically by clicking "Verify Anki Connect" below. DO NOT change field names when editing or adding card templates in Anki',
      tags: 'Tags',
      tags_help: 'Anki notes can include tags separated with commas.',
      escapeHTML: 'Escape HTML',
      escapeHTML_help:
        'Escape HTML entities. Turn off if using HTML for manual layout.',
      syncServer: 'Sync Server',
      syncServer_help:
        'Sync to server(e.g. AnkiWeb) after new words being added to local Anki.'
    }
  },

  titlebarOffset: {
    title: 'Calibrate Titlebar Height',
    help:
      'Different systems or browser settings may result in different titlebar height. Saladict will attempt to calibrate automatically. If you may adjust manually.',
    main: 'Normal',
    main_help: 'Normal windows may not have titlebar.',
    panel: 'Panel',
    panel_help:
      'Saladict standalone quick search panel is a type of panel window.',
    calibrate: 'Auto-calibrate',
    calibrateSuccess: 'Calibration success',
    calibrateError: 'Calibration failed'
  },

  headInfo: {
    acknowledgement: {
      title: 'Acknowledgement',
      yipanhuasheng:
        "for adding Merriam Webster's Dict, American Heritage Dict, Oxford Learner's Dict and Eudic Notebook sync service; and updating Urban Dict and Naver Dict",
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

  form: {
    url_error: 'Incorrect URL.',
    number_error: 'Incorrect number.'
  },

  preload: {
    title: 'Preload',
    auto: 'Auto search',
    auto_help: 'Search automatically when panel shows up.',
    clipboard: 'Clipboard',
    help: 'Preload content in search box when panel shows up.',
    selection: 'Page Selection'
  },

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
  },

  import_export_help:
    'Configs are auto-synced via browser. Here you can also import/export manually. Backups are exported as plain text files. Please encrypt it yourself if needed.',

  import: {
    title: 'Import Configs',
    error: {
      title: 'Import Error',
      parse: 'Unable to parse backup. Incorrect format.',
      load: 'Unable to load backup. Browser cannot obtain the local file.',
      empty: 'No valid data found in the backup.'
    }
  },

  export: {
    title: 'Export Configs',
    error: {
      title: 'Export Error',
      empty: 'No config to export.',
      parse: 'Unable to parse configs.'
    }
  },

  dictAuth: {
    description:
      'As the number of Saladict users grows, if you make heavily use of machine translation services it is recommended to register an account for better stability and accuracy. The account data will only be stored in the browser.',
    dictHelp: 'See the official website of {dict}.',
    manage: 'Manage Translator Accounts'
  },

  third_party_privacy: 'Third Party Privacy',
  third_party_privacy_help:
    'Saladict will not collect further information but search text and releated cookies will be sent to third party dictionary services(just like how you would search on their websites). If you do not want third party services to collect you data, remove the corresponding dictionaries at "Dictionaries" settings.',
  third_party_privacy_extra:
    'Cannot be turned off as it is the core functionality of Saladict.',

  permissions: {
    success: 'Permission requested',
    cancel_success: 'Permission cancelled',
    failed: 'Permission request failed',
    cancelled: 'Permission request cancelled by user',
    missing:
      'Missing permission "{{permission}}". Either grant it or disable related functions.',
    clipboardRead: 'Read Clipboard',
    clipboardRead_help:
      'This permission is needed when clipboard preload is enable for popup panel or quick search panel.',
    clipboardWrite: 'Write Clipboard',
    clipboardWrite_help:
      'This permission is needed when using titlebar menus to copy source/target text from machine translator.'
  },

  unsupportedFeatures: {
    ff: 'Feature "{{feature}}" is not supported in Firefox.'
  }
}
