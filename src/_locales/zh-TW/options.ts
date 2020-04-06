import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: '沙拉查詞設定',
  previewPanel: '預覽字典介面',
  dict: {
    add: '新增字典',
    default_height: '字典預設高度',
    default_height_help:
      '字典初次出現的最大高度。超出此高度的內容將被隱藏並顯示下箭頭。',
    default_unfold: '自動展開',
    default_unfold_help:
      '關閉後此字典將不會自動搜尋，除非點選「展開」箭頭。適合一些需要時再深入瞭解的字典，以加快初次查字典速度。',
    lang: {
      de: '德',
      en: '英',
      es: '西',
      fr: '法',
      ja: '日',
      kor: '韓',
      zhs: '简',
      zht: '繁'
    },

    more_options: '更多設定',
    sel_lang: '選詞語言',
    sel_lang_help: '當選中的文字包含相對應的語言時才顯示這個字典。',
    sel_word_count: '選詞字數',
    sel_word_count_help: '當選中文字的字數符合條件時才顯示該詞典。'
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

  match_pattern_description:
    '網址支援比對模式（<a href="https://developer.mozilla.org/zh-CN/Add-ons/WebExtensions/Match_patterns#範例" target="_blank">例子</a>）。留空儲存即可清除。',
  msg_update_error: '設定更新失敗',
  msg_updated: '設定已更新',
  nav: {
    BlackWhiteList: '黑白名單',
    ContextMenus: '右鍵選單',
    Dictionaries: '字典設定',
    DictPanel: '字典介面',
    General: '基本選項',
    ImportExport: '匯入匯出',
    Notebook: '單字管理',
    PDF: 'PDF 設定',
    Popup: '右上彈出式視窗',
    Profiles: '情景模式',
    QuickSearch: '迅速查字',
    SearchModes: '查字習慣',
    Privacy: '隱私設定'
  },

  opt: {
    active: '啟用滑鼠選字翻譯',
    analytics: '啟用 Google Analytics',
    analytics_help:
      '提供匿名裝置瀏覽器版本資訊。沙拉查詞作者會優先支援使用者更多的裝置和瀏覽器。',
    animation: '啟用轉換動畫',
    animation_help: '在低效能裝置上關閉過渡動畫可減少渲染負擔。',
    app_active_help: '關閉後「迅速查字」功能依然可用。',
    autopron: {
      accent: '優先口音',
      accent_uk: '英式',
      accent_us: '美式',
      cn: '中文自動發音',
      en: '英文自動發音',
      machine: '機器自動發音',
      machine_src: '機器發音部分',
      machine_src_help: '機器翻譯字典需要在下方新增並啟用才會自動發音。',
      machine_src_search: '朗讀原文',
      machine_src_trans: '朗讀翻譯'
    },
    browserAction: {
      open: '點選網址列旁圖示',
      openDictPanel: '開啟字典介面',
      openFav: '新增選詞到生字本',
      openHelp:
        '點選網址列旁 Saladict 圖示時發生的操作。沿用了「右鍵選單」的條目，可以前往該設定頁面增加或編輯。',
      openOptions: '進入 Saladict 設定',
      openStandalone: '開啟快捷查詞獨立視窗'
    },
    bowl_hover: '圖示暫留查字',
    bowl_hover_help: '滑鼠暫留在沙拉圖示上開啟字典介面，否則需要點選。',
    bowl_offset: {
      x: '沙拉圖示水平偏移',
      y: '沙拉圖示垂直偏移'
    },
    config: {
      export: '匯出設定',
      help: '設定已通過瀏覽器自動同步，也可以手動匯入匯出。',
      import: '匯入設定',
      import_error: '匯入設定失敗',
      reset: '重設設定',
      reset_confirm: '所有設定將還原至預設值，確定？'
    },
    context_description:
      '設定右鍵選單，可新增可自定義連結。網頁翻譯其實不需要沙拉查詞，故已有的有道和谷歌網頁翻譯目前處於維護狀態，沒有計劃新增新功能，請用其它官方擴充套件如彩雲小譯和谷歌翻譯。',
    context_menus_title: '新增右鍵選單項目',
    context_menus_add_rules: '連結中的 %s 會被取代為選詞。',
    ctx_trans: '上下文翻譯引擎',
    ctx_trans_help: '單字加入生字本前會自動翻譯上下文。',
    dark_mode: '黑暗模式',
    dictPanel: {
      custom_css: '自訂查字介面樣式',
      custom_css_help:
        '為查詞面板新增自定義 CSS 。詞典面板使用 .dictPanel-Root 作為根，詞典使用 .dictRoot 或者 .d-詞典ID 作為根。',
      font_size: '字典內容字型大小',
      height_ratio: '字典介面最高占螢幕高度比例',
      width: '查字典介面寬度'
    },
    dict_selected: '已選字典',
    double_click_delay: '滑鼠按兩下間隔',
    edit_on_fav: '紅心單字時彈出編輯介面',
    edit_on_fav_help:
      '關閉後，點選紅心生詞將自動新增到生詞本，上下文翻譯亦會自動獲取。',
    history: '記錄查字歷史',
    history_help: '查字典記錄可能會泄漏您的瀏覽痕跡。',
    history_inco: '在無痕模式中記錄',
    language: '介面語言',
    mta: '自動展開多行搜尋框',
    mta_always: '保持展開',
    mta_never: '永遠不展開',
    mta_once: '展開一次',
    mta_popup: '只在右上彈框展開',
    no_type_field: '不在輸入框滑鼠滑字',
    no_type_field_help:
      '開啟後，本程式會自動識別輸入框以及常見編輯器，如 CodeMirror、ACE 和 Monaco。',
    pdf_blackwhitelist_help: '黑名單相符的 PDF 連結將不會跳至 Saladict 開啟。',
    pdf_sniff: '使用本應用程式瀏覽 PDF',
    pdf_sniff_help:
      '開啟後所有 PDF 連結將自動跳至本套件開啟（包括本機，如果在套件管理頁面勾選了允許）。',
    third_party_privacy: '第三方隱私',
    third_party_privacy_help:
      '沙拉查詞不會收集更多資料，但在查詞時單詞以及相關 cookies 資料會發送給第三方詞典服務（與在該網站上查詞一樣），如果你不希望被該服務獲取資料，請在「詞典設定」中關閉相應詞典。',
    third_party_privacy_extra: '本特性為沙拉查詞核心功能，無法關閉。',
    profile_change: '此選項會因「情景模式」而改變。',
    quick_search: '啟用快速鍵',
    search_suggests: '輸入時顯示候選',
    sel_blackwhitelist: '選詞黑白名單',
    sel_blackwhitelist_help: '黑名單相符的頁面 Saladict 將不會響應滑鼠劃詞。',
    sel_lang: '選詞語言',
    sel_lang_help: '當選取的文字包含相對應的語言時，才進行尋找。',
    sel_lang_warning:
      '注意日語與韓語也包含了漢字。法語、德語和西語也包含了英文。若取消了中文或英語而勾選了其它語言，則只翻譯那些語言獨有的部分，如日語只翻譯假名。',
    shortcuts: '設定快速鍵',
    searchMode: {
      direct: '直接搜尋',
      direct_help: '直接顯示字典視窗介面。',
      double: '滑鼠按兩下',
      double_help: '滑鼠按兩下所選擇的句子或單字後，會直接顯示字典視窗介面。',
      holding: '按住按键',
      holding_help:
        '在放開滑鼠之前，需按住選擇的按鍵才顯示字典視窗介面（Meta 鍵為 Mac 上的「⌘ Command」鍵以及其它鍵盤的「⊞ Windows」鍵）。',
      icon: '顯示圖示',
      iconHelp:
        '在滑鼠附近顯示一個圖示，滑鼠移動到圖示後，會顯示出字典的視窗介面。',
      instant: '滑鼠懸浮取詞',
      instantDelay: '取詞等待',
      instantDirect: '直接取詞',
      instantHelp:
        '自動選取滑鼠附近的單字，自動選取滑鼠附近的單詞，因技術限制，懸浮取詞通過自動選擇滑鼠附近單字實現，不設定按鍵直接取詞可能導致滑鼠無法選字，建議配合快速鍵開啟關閉。',
      instantKey: '按鍵',
      mode: '普通選詞',
      panelMode: '字典視窗介面內部選詞',
      pinMode: '字典視窗介面釘住后選詞',
      qsPanelMode: '滑鼠選字'
    },
    syncShanbay: '新增扇貝生詞本同步',
    syncWebdav: '新增 WebDAV 同步',
    touch_mode: '觸控模式',
    touch_mode_help: '支援觸控相關選字',
    update_check: '檢查更新',
    update_check_help: '自動檢查 Github 更新',
    waveform: '波形控制',
    waveform_help:
      '在字典介面下方顯示音訊控制面板展開按鈕。關閉依然可以播放音訊。'
  },

  quickSearch: {
    height: '視窗高度',
    help:
      '連續按三次<kbd>⌘ Command</kbd>（Mac）或者<kbd>Ctrl</kbd>（其它鍵盤）（或設定瀏覽器快速鍵），將會彈出字典視窗介面。',
    loc: '出現位置',
    page_sel: '響應滑字',
    page_sel_help: '對網頁滑鼠滑字作出反應。',
    sidebar: '類側邊欄',
    sidebar_help: '並排顯示視窗以達到類似側邊欄的配置。',
    standalone: '獨立視窗',
    standalone_help:
      '顯示為獨立的視窗（響應瀏覽器以外的滑鼠選字見 <a href="https://saladict.crimx.com/manual.html#shortcuts" target="_blank">這裡</a>）。',
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
    }
  },

  preload: {
    title: '預先下載',
    auto: '自動查字',
    auto_help: '字典介面出現時自動搜尋預先載入內容。',
    clipboard: '剪貼簿',
    help: '字典介面出現時預先載入內容到搜尋框。',
    selection: '滑鼠選字'
  },

  profiles: {
    add_name: '新增情景模式名稱',
    delete_confirm: '「{{name}}」將被刪除，確認？',
    edit_name: '變更情景模式名稱',
    help:
      '每個情景模式相當於一套獨立的設定，一些選項（帶有 <span style="color:#f5222d">*</span>）會隨著情景模式變化。滑鼠懸浮在字典介面的選單圖示上可快速切換，或者焦點選中選單圖示然後按<kbd>↓</kbd>。'
  },

  sync: {
    description: '資料同步設定。',
    start: '同步已在背景開始',
    success: '同步成功',
    failed: '同步失敗',
    close_confirm: '設定未儲存，關閉？',
    delete_confirm: '清空同步設定？',
    error_url: '不正確的超連結格式。',
    shanbay: {
      title: '扇貝生詞本同步',
      description:
        '先去 shanbay.com 登入扇貝（退出後將失效）。開啟後將單向同步到扇貝生詞本（只從沙拉查詞到扇貝），只同步新增單詞（刪除不同步），只同步單詞本身（上下文等均不能同步）。生詞需要扇貝單詞庫支援才能被新增。',
      login: '將開啟扇貝官網，請登入再回來重新開啟。',
      sync_all: '上傳現有的所有生字',
      sync_all_confirm:
        '生詞本存在較多單詞，將分批上傳。注意短時間上傳太多有可能會導致封號，且不可恢復，確定繼續？',
      sync_last: '上傳最近的一個生字'
    },

    webdav: {
      checking: '連線中...',
      duration: '同步頻率',
      duration_help:
        '新增生字後會馬上上傳，資料會在上傳前保證同步，所以如果不需要多個瀏覽器即時檢視更新，可將更新檢查週期調大些以減少資源佔用及避免伺服器拒絕回應。',
      err_exist: '伺服器上 Saladict 目錄下的檔案將被替換。先下載合併到本機？',
      err_mkcol: '無法在伺服器建立“Saladict”目錄。請手動在伺服器上建立。',
      err_network: '連線伺服器失敗。',
      err_parse: '伺服器返回 XML 格式不正確。',
      err_unauthorized: '帳戶或密碼不正確。',
      err_unknown: '不詳錯誤 「{{error}}」。',
      explain:
        '應用設定（包括本設定）已通過瀏覽器自動同步。生詞本可通過本設定實現 WebDAV 同步。<a href="http://help.jianguoyun.com/?p=2064" target="_blank">參考堅果雲設定</a>。',
      passwd: '密碼',
      title: 'WebDAV 同步',
      url: '伺服器位址',
      user: '帳戶'
    }
  }
}
