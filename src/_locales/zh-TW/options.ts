import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: '沙拉查詞設定',
  previewPanel: '預覽字典介面',
  shortcuts: '設定快速鍵',
  msg_update_error: '設定更新失敗',
  msg_updated: '設定已更新',
  msg_first_time_notice: '初次使用注意',
  msg_err_permission: '許可權“{{permission}}”申請失敗。',
  unsave_confirm: '修改尚未儲存，確定放棄？',
  nativeSearch: '瀏覽器外選字翻譯',
  firefox_shortcuts:
    '位址列跳轉到 about:addons，點選右上方的齒輪，選擇最後一項管理擴充套件快捷鍵',
  tutorial: '教程',
  page_selection: '網頁選字',

  nav: {
    General: '基本選項',
    Notebook: '單字管理',
    Profiles: '情景模式',
    DictPanel: '字典介面',
    SearchModes: '查字習慣',
    Dictionaries: '字典設定',
    DictAuths: '詞典帳號',
    Popup: '右上彈出式視窗',
    QuickSearch: '迅速查字',
    Pronunciation: '朗讀設定',
    PDF: 'PDF 設定',
    ContextMenus: '右鍵選單',
    BlackWhiteList: '黑白名單',
    ImportExport: '匯入匯出',
    Privacy: '隱私設定',
    Permissions: '許可權管理'
  },

  config: {
    active: '啟用滑鼠選字翻譯',
    active_help: '關閉後「迅速查字」功能依然可用。',
    animation: '啟用轉換動畫',
    animation_help: '在低效能裝置上關閉過渡動畫可減少渲染負擔。',
    runInBg: '保持瀏覽器執行',
    runInBg_help:
      '讓瀏覽器關閉後依然保持執行，從而繼續響應快捷鍵以及瀏覽器外劃字（見右上角官網使用說明）。',
    darkMode: '黑暗模式',
    langCode: '介面語言',
    editOnFav: '紅心單字時彈出編輯介面',
    editOnFav_help:
      '關閉後，點選紅心生詞將自動新增到生詞本，上下文翻譯亦會自動獲取。',
    searchHistory: '記錄查字歷史',
    searchHistory_help: '查字典記錄可能會泄漏您的瀏覽痕跡。',
    searchHistoryInco: '在無痕模式中記錄',
    ctxTrans: '上下文翻譯引擎',
    ctxTrans_help: '單字加入生字本前會自動翻譯上下文。',
    searchSuggests: '輸入時顯示候選',
    panelMaxHeightRatio: '字典介面最高占螢幕高度比例',
    panelWidth: '查字典介面寬度',
    fontSize: '字典內容字型大小',
    bowlOffsetX: '沙拉圖示水平偏移',
    bowlOffsetY: '沙拉圖示垂直偏移',
    panelCSS: '自訂查字介面樣式',
    panelCSS_help:
      '為查詞面板新增自定義 CSS 。詞典面板使用 .dictPanel-Root 作為根，詞典使用 .dictRoot 或者 .d-詞典ID 作為根。',
    noTypeField: '不在輸入框滑鼠滑字',
    noTypeField_help:
      '開啟後，本程式會自動識別輸入框以及常見編輯器，如 CodeMirror、ACE 和 Monaco。',
    touchMode: '觸控模式',
    touchMode_help: '支援觸控相關選字',
    language: '選詞語言',
    language_help: '當選取的文字包含相對應的語言時，才進行尋找。',
    language_extra:
      '注意日語與韓語也包含了漢字。法語、德語和西語也包含了英文。若取消了中文或英語而勾選了其它語言，則只翻譯那些語言獨有的部分，如日語只翻譯假名。',
    doubleClickDelay: '滑鼠按兩下間隔',
    mode: '普通選字',
    panelMode: '字典視窗介面內部選字',
    pinMode: '字典視窗介面釘住后選字',
    qsPanelMode: '獨立字典視窗介面響應頁面選字',
    bowlHover: '圖示暫留查字',
    bowlHover_help: '滑鼠暫留在沙拉圖示上開啟字典介面，否則需要點選。',
    autopron: {
      cn: {
        dict: '中文自動發音'
      },
      en: {
        dict: '英文自動發音',
        accent: '優先口音'
      },
      machine: {
        dict: '機器自動發音',
        src: '機器發音部分',
        src_help: '機器翻譯字典需要在下方新增並啟用才會自動發音。',
        src_search: '朗讀原文',
        src_trans: '朗讀翻譯'
      }
    },
    pdfSniff: '嗅探 PDF 連結',
    pdfSniff_help:
      '開啟後所有 PDF 連結將自動跳至本套件開啟（包括本機，如果在套件管理頁面勾選了允許）。',
    pdfSniff_extra:
      '現在更推薦使用自己喜歡的本地閱讀器搭配{瀏覽器外選字翻譯}。',
    pdfStandalone: '獨立視窗',
    pdfStandalone_help:
      '在獨立視窗中開啟 PDF 閱讀器。獨立視窗只有標題欄，佔用更少空間，但不能複製連結等操作。',
    baOpen: '點選網址列旁圖示',
    baOpen_help:
      '點選網址列旁 Saladict 圖示時發生的操作。沿用了「右鍵選單」的條目，可以前往該設定頁面增加或編輯。',
    tripleCtrl: '啟用 Ctrl 快速鍵',
    tripleCtrl_help:
      '連續按三次{⌘ Command}（macOS）或者{Ctrl}（其它鍵盤）（或設定瀏覽器快速鍵），將會彈出字典視窗介面。',
    qsLocation: '出現位置',
    qsFocus: '出現時獲取焦點',
    qsStandalone: '獨立視窗',
    qsStandalone_help: '顯示為獨立的視窗，支援{瀏覽器外選字翻譯}。',
    qssaSidebar: '類側邊欄',
    qssaSidebar_help: '並排顯示視窗以達到類似側邊欄的配置。',
    qssaHeight: '視窗高度',
    qssaPageSel: '響應滑字',
    qssaPageSel_help: '對網頁滑鼠滑字作出反應。',
    qssaRectMemo: '記住位置和大小',
    qssaRectMemo_help: '獨立視窗關閉時記住位置和大小。',
    updateCheck: '檢查更新',
    updateCheck_help: '自動檢查更新',
    analytics: '啟用 Google Analytics',
    analytics_help:
      '提供匿名裝置瀏覽器版本資訊。因精力有限，沙拉查詞作者會盡可能支援使用者量更多的裝置和瀏覽器。',

    opt: {
      reset: '重設設定',
      reset_confirm: '所有設定將還原至預設值，確定？',
      upload_error: '設定儲存失敗',
      accent: {
        uk: '英式',
        us: '美式'
      },
      sel_blackwhitelist: '選詞黑白名單',
      sel_blackwhitelist_help: '黑名單相符的頁面 Saladict 將不會響應滑鼠劃詞。',
      pdf_blackwhitelist_help:
        '黑名單相符的 PDF 連結將不會跳至 Saladict 開啟。',
      contextMenus_description:
        '設定右鍵選單，可新增可自定義連結。網頁翻譯其實不需要沙拉查詞，故已有的有道和谷歌網頁翻譯目前處於維護狀態，沒有計劃新增新功能，請用其它官方擴充套件如彩雲小譯和谷歌翻譯。',
      contextMenus_edit: '編輯右鍵選單項目',
      contextMenus_url_rules: '連結中的 %s 會被取代為選詞。',
      baOpen: {
        popup_panel: '開啟字典介面',
        popup_fav: '新增選詞到生字本',
        popup_options: '進入 Saladict 設定',
        popup_standalone: '開啟快捷查詞獨立視窗'
      },
      openQsStandalone: '獨立視窗設定',
      pdfStandalone: {
        default: '從不',
        always: '總是',
        manual: '手動'
      }
    }
  },

  matchPattern: {
    description: '網址支援{超鏈匹配}和{正則匹配}。留空儲存即可清除。',
    url: '連結匹配',
    url_error: '不正確的超連結模式匹配表示式。',
    regex: '正則匹配',
    regex_error: '不正確的正則表示式。'
  },

  searchMode: {
    icon: '顯示圖示',
    icon_help:
      '在滑鼠附近顯示一個圖示，滑鼠移動到圖示後，會顯示出字典的視窗介面。',
    direct: '直接搜尋',
    direct_help: '直接顯示字典視窗介面。',
    double: '滑鼠按兩下',
    double_help: '滑鼠按兩下所選擇的句子或單字後，會直接顯示字典視窗介面。',
    holding: '按住按键',
    holding_help:
      '在放開滑鼠之前，需按住選擇的按鍵才顯示字典視窗介面（Alt 為 macOS 上的 "⌥ Option"鍵。Meta 鍵為 macOS 上的「⌘ Command」鍵以及其它鍵盤的「⊞ Windows」鍵）。',
    instant: '滑鼠懸浮取詞',
    instant_help: '自動選取滑鼠附近的單字。',
    instantDirect: '直接取詞',
    instantKey: '按鍵',
    instantKey_help:
      '因技術限制，懸浮取詞通過自動選擇滑鼠附近單字實現，不設定按鍵直接取詞可能導致滑鼠無法選字，建議配合快速鍵開啟關閉。',
    instantDelay: '取詞等待'
  },

  profiles: {
    opt: {
      add_name: '新增情景模式名稱',
      delete_confirm: '「{{name}}」將被刪除，確認？',
      edit_name: '變更情景模式名稱',
      help:
        '每個情景模式相當於一套獨立的設定，一些選項（帶有 {*}）會隨著情景模式變化。滑鼠懸浮在字典介面的選單圖示上可快速切換，或者焦點選中選單圖示然後按{↓}。'
    }
  },

  profile: {
    mtaAutoUnfold: '自動展開多行搜尋框',
    waveform: '波形控制',
    waveform_help:
      '在字典介面下方顯示音訊控制面板展開按鈕。關閉依然可以播放音訊。',
    stickyFold: '記憶摺疊',
    stickyFold_help:
      '查字時記住之前手動展開和收起字典的狀態，只在同個頁面生效。',

    opt: {
      item_extra: '此選項會因「情景模式」而改變。',
      mtaAutoUnfold: {
        always: '保持展開',
        never: '永遠不展開',
        once: '展開一次',
        popup: '只在右上彈框展開'
      },
      dict_selected: '已選字典'
    }
  },

  dict: {
    add: '新增字典',
    more_options: '更多設定',

    selectionLang: '選詞語言',
    selectionLang_help: '當選中的文字包含相對應的語言時才顯示這個字典。',
    defaultUnfold: '自動展開',
    defaultUnfold_help:
      '關閉後此字典將不會自動搜尋，除非點選「展開」箭頭。適合一些需要時再深入瞭解的字典，以加快初次查字典速度。',
    selectionWC: '選詞字數',
    selectionWC_help:
      '當選中文字的字數符合條件時才顯示該詞典。可設定 999999 如果不希望限制字數。',
    preferredHeight: '字典預設高度',
    preferredHeight_help:
      '字典初次出現的最大高度。超出此高度的內容將被隱藏並顯示下箭頭。可設定 999999 如果不希望限制高度。',

    lang: {
      de: '德',
      en: '英',
      es: '西',
      fr: '法',
      ja: '日',
      kor: '韓',
      zhs: '简',
      zht: '繁'
    }
  },

  syncService: {
    description: '資料同步設定。',
    start: '同步進行中，結束前請勿關閉此頁面。',
    finished: '同步結束',
    success: '同步成功',
    failed: '同步失敗',
    close_confirm: '設定未儲存，關閉？',
    delete_confirm: '清空同步設定？',

    shanbay: {
      description:
        '先去 shanbay.com 登入扇貝（退出後將失效）。開啟後將單向同步到扇貝生詞本（只從沙拉查詞到扇貝），只同步新增單詞（刪除不同步），只同步單詞本身（上下文等均不能同步）。生詞需要扇貝單詞庫支援才能被新增。',
      login: '將開啟扇貝官網，請登入再回來重新開啟。',
      sync_all: '上傳現有的所有生字',
      sync_all_confirm:
        '生詞本存在較多單詞，將分批上傳。注意短時間上傳太多有可能會導致封號，且不可恢復，確定繼續？',
      sync_last: '上傳最近的一個生字'
    },

    webdav: {
      description:
        '應用設定（包括本設定）已通過瀏覽器自動同步。生詞本可通過本設定實現 WebDAV 同步。',
      jianguo: '參考堅果雲設定',
      checking: '連線中...',
      exist_confirm: '伺服器上已存在 Saladict 目錄。是否下載合併到本地？',
      upload_confirm: '馬上上傳本地資料到伺服器？',
      verify: '驗證伺服器',
      verified: '成功驗證伺服器',
      duration: '同步頻率',
      duration_help:
        '新增生字後會馬上上傳，資料會在上傳前保證同步，所以如果不需要多個瀏覽器即時檢視更新，可將更新檢查週期調大些以減少資源佔用及避免伺服器拒絕回應。',
      passwd: '密碼',
      url: '伺服器位址',
      user: '帳戶'
    },

    ankiconnect: {
      description: '請確保 Anki Connect 已安裝且 Anki 在執行。',
      checking: '連線中...',
      deck_confirm: '牌組「{{deck}}」不存在 Anki 中，是否自動新增？',
      deck_error: '無法建立牌組「{{deck}}」。',
      notetype_confirm:
        '筆記型別「{{noteType}}」不存在 Anki 中，是否自動新增？',
      notetype_error: '無法建立筆記型別「{{noteType}}」。',
      upload_confirm:
        '馬上同步本地生詞到 Anki？重複的單詞（相同“Date”）會被跳過。',
      add_yourself: '請在 Anki 中自行新增。',
      verify: '檢查 Anki Connect',
      verified: '成功檢查 Anki Connect',
      enable_help:
        '開啟後每次儲存新單字都會自動同步到 Anki。Anki 上已存在的單字（以“Date”為準）可以在單字編輯器中編輯強制更新覆蓋到 Anki。',
      host: '地址',
      port: '埠',
      key: 'Key',
      key_help: '可在 Anki Connect 外掛中設定 key 以做簡單令牌。',
      deckName: '牌組',
      deckName_help:
        '如果不存在的話可以點下方「檢查 Anki Connect」讓本設定生成預設牌組。',
      noteType: '筆記型別',
      noteType_help:
        'Anki 筆記型別包括一套欄位和卡片型別。如果不存在的話可以點下方「檢查 Anki Connect」讓本設定生成一套預設的筆記型別。如需自行在 Anki 新增或修改卡片模板請不要更改欄位名字。',
      tags: '標籤',
      tags_help: 'Anki 筆記可以附帶標籤。以逗號分割。',
      escapeHTML: '轉義 HTML',
      escapeHTML_help:
        '對筆記內容中的 HTML 字元進行轉義。如手動進行 HTML 排版請關閉選項。',
      syncServer: '同步伺服器',
      syncServer_help: '單詞新增到本地 Anki 後自動同步到伺服器（如 AnkiWeb）。'
    }
  },

  titlebarOffset: {
    title: '校準標題欄高度',
    help:
      '不同的系統以及不同的瀏覽器設定會影響標題欄高度，沙拉查詞會嘗試自動校準，如彈出視窗依然出現偏移可自行調整。',
    main: '普通視窗',
    main_help: '普通視窗可能沒有標題欄。',
    panel: '簡化視窗',
    panel_help: '沙拉查詞的獨立視窗快捷查詞介面為簡化視窗。',
    calibrate: '自動校準',
    calibrateSuccess: '自動校準成功',
    calibrateError: '自動校準失敗'
  },

  headInfo: {
    acknowledgement: {
      title: '特別鳴謝',
      naver: '協助新增 Naver 韓國語字典',
      shanbay: '編寫扇貝詞典模組',
      trans_tw: '提供部分繁體中文翻譯',
      weblio: '協助新增 Weblio 辭書'
    },
    contact_author: '聯絡作者',
    donate: '支援項目',
    instructions: '使用說明',
    report_issue: '軟體使用疑問和建言'
  },

  form: {
    url_error: '不正確的超連結格式。',
    number_error: '不正確的數字'
  },

  preload: {
    title: '預先下載',
    auto: '自動查字',
    auto_help: '字典介面出現時自動搜尋預先載入內容。',
    clipboard: '剪貼簿',
    help: '字典介面出現時預先載入內容到搜尋框。',
    selection: '滑鼠選字'
  },

  locations: {
    CENTER: '居中',
    TOP: '上方',
    RIGHT: '右方',
    BOTTOM: '下方',
    LEFT: '左方',
    TOP_LEFT: '左上',
    TOP_RIGHT: '右上',
    BOTTOM_LEFT: '左下',
    BOTTOM_RIGHT: '右下'
  },

  import_export_help:
    '設定已通過瀏覽器自動同步，也可以手動匯入匯出。備份為明文儲存，對安全性有要求的請自行加密。',

  import: {
    title: '匯入設定',
    error: {
      title: '匯入失敗',
      parse: '備份解析失敗，格式不正確。',
      load: '備份載入失敗，瀏覽器無法獲得本地備份。',
      empty: '備份中沒有發現有效資料。'
    }
  },

  export: {
    title: '匯出設定',
    error: {
      title: '匯出失敗',
      empty: '沒有設定可以匯出。',
      parse: '設定解析失敗，無法匯出。'
    }
  },

  dictAuth: {
    description:
      '隨著沙拉查詞使用者增多，如經常使用機器翻譯，建議到官網申請帳號以獲得更穩定的體驗以及更準確的結果。',
    dictHelp: '見{詞典}官網。',
    manage: '管理私用帳號'
  },

  third_party_privacy: '第三方隱私',
  third_party_privacy_help:
    '沙拉查詞不會收集更多資料，但在查詞時單詞以及相關 cookies 資料會發送給第三方詞典服務（與在該網站上查詞一樣），如果你不希望被該服務獲取資料，請在「詞典設定」中關閉相應詞典。',
  third_party_privacy_extra: '本特性為沙拉查詞核心功能，無法關閉。',

  permissions: {
    success: '申請許可權成功',
    cancel_success: '取消許可權成功',
    failed: '申請許可權失敗',
    cancelled: '申請許可權被使用者取消',
    missing: '缺少許可權「{{permission}}」。請給予許可權或者關閉相關功能。',
    clipboardRead: '讀取剪貼簿',
    clipboardRead_help:
      '快捷查詞或者右上彈框設定預載入剪貼簿時需要讀取剪貼簿許可權。',
    clipboardWrite: '寫入剪貼簿',
    clipboardWrite_help:
      '機器翻譯詞典標題欄選單複製原文譯文或生詞本匯出到剪貼簿需要寫入剪貼簿許可權。'
  },

  unsupportedFeatures: {
    ff: '火狐尚不支援「{{feature}}」功能。'
  }
}
