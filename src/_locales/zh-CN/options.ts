export const locale = {
  title: '沙拉查词设置',
  previewPanel: '预览查词面板',
  shortcuts: '设置快捷键',
  msg_update_error: '设置更新失败',
  msg_updated: '设置已更新',
  unsave_confirm: '修改尚未保存，确定放弃？',
  nativeSearch: '浏览器外划词',

  nav: {
    General: '基本选项',
    Notebook: '单词管理',
    Profiles: '情景模式',
    DictPanel: '查词面板',
    SearchModes: '查词习惯',
    Dictionaries: '词典设置',
    Popup: '右上弹框',
    QuickSearch: '快捷查词',
    Pronunciation: '发音设置',
    PDF: 'PDF 设置',
    ContextMenus: '右键菜单',
    BlackWhiteList: '黑白名单',
    ImportExport: '导入导出',
    Privacy: '隐私设置'
  },

  config: {
    active: '启用划词翻译',
    active_help: '关闭后「快捷查词」功能依然可用。',
    animation: '开启动画过渡',
    animation_help: '在低性能设备上关闭过渡动画可减少渲染负担。',
    darkMode: '黑暗模式',
    langCode: '界面语言',
    editOnFav: '红心单词时弹出编辑面板',
    editOnFav_help:
      '关闭后，点击红心生词将自动添加到生词本，上下文翻译亦会自动获取。',
    searchHistory: '记录查词历史',
    searchHistory_help: '查词记录可能会泄漏您的浏览痕迹。',
    searchHistoryInco: '在私隐模式中记录',
    ctxTrans: '上下文翻译引擎',
    ctxTrans_help: '单词被添加进生词本前会自动翻译上下文。',
    searchSuggests: '输入时显示候选',
    panelMaxHeightRatio: '查词面板最高占屏幕比例',
    panelWidth: '查词面板宽度',
    fontSize: '词典内容字体大小',
    bowlOffsetX: '沙拉图标水平偏移',
    bowlOffsetY: '沙拉图标垂直偏移',
    panelCSS: '自定义查词面板样式',
    panelCSS_help:
      '为查词面板添加自定义 CSS 。词典面板使用 .dictPanel-Root 作为根，词典使用 .dictRoot 或者 .d-词典ID 作为根。',
    noTypeField: '不在输入框划词',
    noTypeField_help:
      '开启后，本扩展会自动识别输入框以及常见编辑器，如 CodeMirror、ACE 和 Monaco。',
    touchMode: '触摸模式',
    touchMode_help: '支持触摸相关选词。',
    language: '划词语言',
    language_help: '当选中的文字包含相应的语言时才进行查找。',
    language_extra:
      '注意日语与韩语也包含了汉字。法语、德语和西语也包含了英文。若取消了中文或英语而勾选了其它语言，则只匹配那些语言独有的部分，如日语只匹配假名。',
    doubleClickDelay: '双击间隔',
    mode: '普通划词',
    panelMode: '查词面板内部划词',
    pinMode: '查词面板钉住后划词',
    qsPanelMode: '页面划词',
    bowlHover: '图标悬停查词',
    bowlHover_help: '鼠标悬停在沙拉图标上触发查词，否则需要点击。',
    autopron: {
      cn: {
        dict: '中文自动发音'
      },
      en: {
        dict: '英文自动发音',
        accent: '优先口音'
      },
      machine: {
        dict: '机器自动发音',
        src: '机器发音部分',
        src_help: '机器翻译词典需要在下方添加并启用才会自动发音。',
        src_search: '朗读原文',
        src_trans: '朗读翻译'
      }
    },
    pdfSniff: '默认用本扩展浏览 PDF',
    pdfSniff_help:
      '开启后所有 PDF 链接将自动跳转到本扩展打开（包括本地，如果在扩展管理页面勾选了允许）。',
    pdfSniff_extra: '现在更推荐使用自己喜欢的本地阅读器搭配{浏览器外划词}。',
    baOpen: '点击地址栏旁图标',
    baOpen_help:
      '点击地址栏旁 Saladict 图标时发生的操作。沿用了「右键菜单」的项目，可以前往该设置页面进行增加或编辑。',
    tripleCtrl: '启用 Ctrl 快捷键',
    tripleCtrl_help:
      '连续按三次{⌘ Command}（Mac）或者{Ctrl}（其它键盘）（或设置浏览器快捷键）将弹出词典界面。',
    tripleCtrlLocation: '出现位置',
    tripleCtrlStandalone: '独立窗口',
    tripleCtrlStandalone_help: '显示为单独的窗口，支持响应{浏览器以外划词}。',
    tripleCtrlSidebar: '类侧边栏',
    tripleCtrlSidebar_help: '并排显示窗口以达到类似侧边栏的布局。',
    tripleCtrlHeight: '窗口高度',
    tripleCtrlPageSel: '响应划词',
    tripleCtrlPageSel_help: '响应网页划词。',

    opt: {
      export: '导出设定',
      help: '设定已通过浏览器自动同步，也可以手动导入导出。',
      import: '导入设定',
      import_error: '导入设定失败',
      reset: '重置设定',
      reset_confirm: '所有设定将还原到默认值，确定？',
      upload_error: '设置保存失败',
      accent: {
        uk: '英式',
        us: '美式'
      },
      sel_blackwhitelist: '划词黑白名单',
      sel_blackwhitelist_help: '黑名单匹配的页面 Saladict 将不会响应鼠标划词。',
      pdf_blackwhitelist_help:
        '黑名单匹配的 PDF 链接将不会跳转到 Saladict 打开。',
      contextMenus_description:
        '设置右键菜单，可添加可自定义链接。网页翻译其实不需要沙拉查词，故已有的有道和谷歌网页翻译目前处于维护状态，没有计划添加新功能，请用其它官方扩展如彩云小译和谷歌翻译。',
      contextMenus_edit: '编辑右键菜单项目',
      contextMenus_url_rules: '链接中的 %s 会被替换为选词。',
      baOpen: {
        popup_panel: '显示查词面板',
        popup_fav: '添加选词到生词本',
        popup_options: '打开 Saladict 设置',
        popup_standalone: '打开快捷查词独立窗口'
      },
      openTripleCtrlStandalone: '打开独立窗口设置'
    }
  },

  matchPattern: {
    description: '网址支持{超链匹配}和{正则匹配}。留空保存即可清除。',
    url: '超链匹配',
    url_error: '不正确的超链接模式表达式。',
    regex: '正则匹配',
    regex_error: '不正确的正则表达式。'
  },

  searchMode: {
    icon: '显示图标',
    icon_help: '在鼠标附近显示一个图标，鼠标移上去后才显示词典面板。',
    direct: '直接搜索',
    direct_help: '直接显示词典面板。',
    double: '双击搜索',
    double_help: '双击选择文本之后直接显示词典面板。',
    holding: '按住按键',
    holding_help:
      '在放开鼠标之前按住选择的按键才显示词典面板（Meta 键为 macOS 上的「⌘ Command」键以及其它键盘的「⊞ Windows」键）。',
    instant: '鼠标悬浮取词',
    instant_help: '自动选取鼠标附近的单词。',
    instantDirect: '直接取词',
    instantKey: '按键',
    instantKey_help:
      '因技术限制，悬浮取词通过自动选择鼠标附近单词实现，不设置按键直接取词可导致无法选词，建议配合快捷键开启关闭。',
    instantDelay: '取词延时'
  },

  profiles: {
    opt: {
      add_name: '新增情景模式名称',
      delete_confirm: '「{{name}}」将被删除，确认？',
      edit_name: '更改情景模式名称',
      help:
        '每个情景模式相当于一套独立的设置，一些选项（带 {*}）会随着情景模式变化。鼠标悬浮在查词面板的菜单图标上可快速切换，或者焦点选中菜单图标然后按{↓}。'
    }
  },

  profile: {
    mtaAutoUnfold: '自动展开多行搜索框',
    waveform: '波形控制按钮',
    waveform_help:
      '在词典面板下方显示音频控制面板展开按钮。控制面板只會在展開時才載入。',

    opt: {
      item_extra: '此选项会因「情景模式」而改变。',
      mtaAutoUnfold: {
        always: '保持展开',
        never: '从不展开',
        once: '展开一次',
        popup: '只在右上弹框展开'
      },
      dict_selected: '已选词典'
    }
  },

  dict: {
    add: '添加词典',
    more_options: '更多设置',

    selectionLang: '划词语言',
    selectionLang_help: '当选中的文字包含相应的语言时才显示该词典。',
    defaultUnfold: '默认展开',
    defaultUnfold_help:
      '关闭后该词典将不会自动搜索，除非点击「展开」箭头。适合一些需要时再深入了解的词典，以加快初次查词速度。',
    selectionWC: '划词字数',
    selectionWC_help:
      '当选中文字的字数符合条件时才显示该词典。可设置 999999 如果不希望限制字数。',
    preferredHeight: '词典默认高度',
    preferredHeight_help:
      '词典初次出现的最大高度。超出此高度的内容将被隐藏并显示下箭头。可设置 999999 如果不希望限制高度。',

    lang: {
      de: '德',
      en: '英',
      es: '西',
      fr: '法',
      ja: '日',
      kor: '韩',
      zhs: '简',
      zht: '繁'
    }
  },

  syncService: {
    description: '数据同步设置。',
    start: '同步已在后台开始',
    success: '同步成功',
    failed: '同步失败',
    close_confirm: '设置未保存，关闭？',
    delete_confirm: '清空同步设置？',

    btn: {
      shanbay: '添加扇贝生词本同步',
      webdav: '添加 WebDAV 同步'
    },

    shanbay: {
      title: '扇贝生词本同步',
      description:
        '先去 shanbay.com 登录扇贝（退出后将失效）。开启后每次添加生词将自动单向同步到扇贝生词本（只从沙拉查词到扇贝），只同步新增单词（删除不同步），只同步单词本身（上下文等均不能同步）。生词需要扇贝单词库支持才能被添加。',
      login: '将打开扇贝官网，请登录再回来重新开启。',
      sync_all: '上传现有的所有生词',
      sync_all_confirm:
        '生词本存在较多单词，将分批上传。注意短时间上传太多有可能会导致封号，且不可恢复，确定继续？',
      sync_last: '上传最近的一个生词'
    },

    webdav: {
      title: 'WebDAV 同步',
      description:
        '应用设置（包括本设置）已通过浏览器自动同步。生词本可通过本设置实现 WebDAV 同步。',
      jianguo: '参考坚果云设置',
      checking: '连接中...',
      duration: '同步周期',
      duration_help:
        '添加生词后会马上上传，数据会在上传前保证同步，所以如果不需要多个浏览器实时查看更新，可将更新检测周期调大些以减少资源占用及避免服务器拒绝响应。',
      err_exist: '服务器上 Saladict 目录下的文件将被替换。先下载合并到本地？',
      err_mkcol: '无法在服务器创建“Saladict”目录。请手动在服务器上创建。',
      err_network: '连接服务器失败。',
      err_parse: '服务器返回 XML 格式不正确。',
      err_unauthorized: '账户或密码不正确。',
      err_unknown: '未知错误 「{{error}}」。',
      err_internal: '无法保存。',
      passwd: '密码',
      url: '服务器地址',
      user: '账户'
    }
  },

  headInfo: {
    acknowledgement: {
      title: '特别鸣谢',
      naver: '协助添加 Naver 韩国语词典',
      shanbay: '编写扇贝词典模块',
      trans_tw: '提供部分繁体中文翻译',
      weblio: '协助添加 Weblio 辞書'
    },
    contact_author: '联系作者',
    donate: '支持项目',
    instructions: '使用说明',
    report_issue: '反馈问题'
  },

  form: {
    url_error: '不正确的超链接格式。',
    number_error: '不正确的数字'
  },

  preload: {
    title: '预先加载',
    auto: '自动查词',
    auto_help: '查词面板出现时自动搜索预加载内容。',
    clipboard: '剪贴板',
    help: '查词面板出现时预先加载内容到搜索框。',
    selection: '页面划词'
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

  opt: {
    analytics: '启用 Google Analytics',
    analytics_help:
      '提供匿名设备浏览器版本信息。沙拉查词作者会优先支持用户量更多的设备和浏览器。',

    third_party_privacy: '第三方隐私',
    third_party_privacy_help:
      '沙拉查词不会收集更多数据，但在查词时单词以及相关 cookies 数据会发送给第三方词典服务（与在该网站上查词一样），如果你不希望被该服务获取数据，请在「词典设置」中关闭相应词典。',
    third_party_privacy_extra: '本特性为沙拉查词核心功能，无法关闭。',
    profile_change: '此选项会因「情景模式」而改变。',

    update_check: '检查更新',
    update_check_help: '自动检查 Github 更新'
  }
}
