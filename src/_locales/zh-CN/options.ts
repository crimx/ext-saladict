export const locale = {
  title: 'Saladict 设置',
  dict: {
    add: '添加词典',
    default_height: '词典默认高度',
    default_height_help:
      '词典初次出现的最大高度。超出此高度的内容将被隐藏并显示下箭头。',
    default_unfold: '默认展开',
    default_unfold_help:
      '关闭后该词典将不会自动搜索，除非点击「展开」箭头。适合一些需要时再深入了解的词典，以加快初次查词速度。',
    lang: {
      de: '德',
      en: '英',
      es: '西',
      fr: '法',
      ja: '日',
      kor: '韩',
      zhs: '简',
      zht: '繁'
    },

    more_options: '更多设置',
    sel_lang: '划词语言',
    sel_lang_help: '当选中的文字包含相应的语言时才显示该词典。',
    sel_word_count: '划词字数',
    sel_word_count_help: '当选中文字的字数符合条件时才显示该词典。'
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
    donate: '随喜捐赠',
    instructions: '使用说明',
    report_issue: '反馈问题'
  },

  match_pattern_description:
    '网址支持匹配模式（<a href="https://developer.mozilla.org/zh-CN/Add-ons/WebExtensions/Match_patterns#范例" target="_blank">例子</a>）。留空保存即可清除。',
  msg_update_error: '设置更新失败',
  msg_updated: '设置已更新',
  nav: {
    BlackWhiteList: '黑白名单',
    ContextMenus: '右键菜单',
    Dictionaries: '词典设置',
    DictPanel: '查词面板',
    General: '基本选项',
    ImportExport: '导入导出',
    Notebook: '单词管理',
    PDF: 'PDF 设置',
    Popup: '右上弹框',
    Profiles: '情景模式',
    QuickSearch: '快捷查词',
    SearchModes: '查词习惯'
  },

  opt: {
    active: '启用划词翻译',
    analytics: '用户体验改进计划',
    analytics_help: '启用 Google Analytics 服务协助开发者改进 Saladict',
    animation: '开启动画过渡',
    animation_help: '在低性能设备上关闭过渡动画可减少渲染负担。',
    app_active_help: '关闭后「快捷查词」功能依然可用。',
    autopron: {
      accent: '优先口音',
      accent_uk: '英式',
      accent_us: '美式',
      cn: '中文自动发音',
      en: '英文自动发音',
      machine: '机器自动发音',
      machine_src: '机器发音部分',
      machine_src_help: '机器翻译词典需要在下方添加并启用才会自动发音。',
      machine_src_search: '朗读原文',
      machine_src_trans: '朗读翻译'
    },
    browserAction: {
      open: '点击地址栏旁图标',
      openDictPanel: '显示查词面板',
      openFav: '添加选词到生词本',
      openHelp:
        '点击地址栏旁 Saladict 图标时发生的操作。沿用了「右键菜单」的项目，可以前往该设置页面进行增加或编辑。',
      openOptions: '打开 Saladict 设置',
      openStandalone: '打开快捷查词独立窗口'
    },
    bowl_hover: '图标悬停查词',
    bowl_hover_help: '鼠标悬停在沙拉图标上触发查词，否则需要点击。',
    bowl_offset: {
      x: '沙拉图标水平偏移',
      y: '沙拉图标垂直偏移'
    },
    config: {
      export: '导出设定',
      help: '设定已通过浏览器自动同步，也可以手动导入导出。',
      import: '导入设定',
      import_error: '导入设定失败',
      reset: '重置设定',
      reset_confirm: '所有设定将还原到默认值，确定？'
    },
    context_description: '设置右键菜单，可添加可自定义链接。',
    context_menus_title: '添加右键菜单项目',
    context_menus_add_rules: '链接中的 %s 会被替换为选词。',
    ctx_trans: '上下文翻译引擎',
    ctx_trans_help: '单词被添加进生词本前会自动翻译上下文。',
    dark_mode: '黑暗模式',
    dictPanel: {
      custom_css: '自定义查词面板样式',
      custom_css_help:
        '为查词面板添加自定义 CSS 。词典面板使用 .dictPanel-Root 作为根，词典使用 .dictRoot 或者 .d-词典ID 作为根。',
      font_size: '词典内容字体大小',
      height_ratio: '查词面板最高占屏幕比例',
      width: '查词面板宽度'
    },
    dict_selected: '已选词典',
    double_click_delay: '双击间隔',
    edit_on_fav: '红心单词时弹出编辑面板',
    edit_on_fav_help:
      '关闭后，点击红心生词将自动添加到生词本，上下文翻译亦会自动获取。',
    history: '记录查词历史',
    history_help: '查词记录可能会泄漏您的浏览痕迹。',
    history_inco: '在私隐模式中记录',
    language: '界面语言',
    mta: '自动展开多行搜索框',
    mta_always: '保持展开',
    mta_never: '从不展开',
    mta_once: '展开一次',
    mta_popup: '只在右上弹框展开',
    no_type_field: '不在输入框划词',
    no_type_field_help:
      '开启后，本扩展会自动识别输入框以及常见编辑器，如 CodeMirror、ACE 和 Monaco。',
    pdf_blackwhitelist_help:
      '黑名单匹配的 PDF 链接将不会跳转到 Saladict 打开。',
    pdf_sniff: '默认用本扩展浏览 PDF',
    pdf_sniff_help:
      '开启后所有 PDF 链接将自动跳转到本扩展打开（包括本地，如果在扩展管理页面勾选了允许）。',
    profile_change: '此选项会因「情景模式」而改变。',
    quick_search: '启用快捷键',
    search_suggests: '输入时显示候选',
    sel_blackwhitelist: '划词黑白名单',
    sel_blackwhitelist_help: '黑名单匹配的页面 Saladict 将不会响应鼠标划词。',
    sel_lang: '划词语言',
    sel_lang_help: '当选中的文字包含相应的语言时才进行查找。',
    sel_lang_warning:
      '注意日语与韩语也包含了汉字。法语、德语和西语也包含了英文。若取消了中文或英语而勾选了其它语言，则只匹配那些语言独有的部分，如日语只匹配假名。',
    shortcuts: '设置快捷键',
    searchMode: {
      direct: '直接搜索',
      direct_help: '直接显示词典面板。',
      double: '双击搜索',
      double_help: '双击选择文本之后直接显示词典面板。',
      holding: '按住按键',
      holding_help:
        '在放开鼠标之前按住选择的按键才显示词典面板（Meta 键为 Mac 上的「⌘ Command」键以及其它键盘的「⊞ Windows」键）。',
      icon: '显示图标',
      iconHelp: '在鼠标附近显示一个图标，鼠标移上去后才显示词典面板。',
      instant: '鼠标悬浮取词',
      instantDelay: '取词延时',
      instantDirect: '直接取词',
      instantHelp:
        '自动选取鼠标附近的单词，因技术限制，悬浮取词通过自动选择鼠标附近单词实现，不设置按键直接取词可导致无法选词，建议配合快捷键开启关闭。',
      instantKey: '按键',
      mode: '普通划词',
      panelMode: '查词面板内部划词',
      pinMode: '查词面板钉住后划词',
      qsPanelMode: '页面划词'
    },
    syncShanbay: '添加扇贝生词本同步',
    syncWebdav: '添加 WebDAV 同步',
    touch_mode: '触摸模式',
    touch_mode_help: '支持触摸相关选词',
    waveform: '波形控制按钮',
    waveform_help:
      '在词典面板下方显示音频控制面板展开按钮。关闭依然可以播放音频。'
  },

  quickSearch: {
    height: '窗口高度',
    help:
      '连续按三次<kbd>⌘ Command</kbd>（Mac）或者<kbd>Ctrl</kbd>（其它键盘）（或设置浏览器快捷键）将弹出词典界面。',
    loc: '出现位置',
    page_sel: '响应划词',
    page_sel_help: '响应网页划词。',
    sidebar: '类侧边栏',
    sidebar_help: '并排显示窗口以达到类似侧边栏的布局。',
    standalone: '独立窗口',
    standalone_help:
      '显示为单独的窗口（响应浏览器以外的划词见<a href="https://saladict.crimx.com/manual.html#shortcuts" target="_blank">这里</a>）。',
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
    title: '预先加载',
    auto: '自动查词',
    auto_help: '查词面板出现时自动搜索预加载内容。',
    clipboard: '剪贴板',
    help: '查词面板出现时预先加载内容到搜索框。',
    selection: '页面划词'
  },

  profiles: {
    add_name: '新增情景模式名称',
    delete_confirm: '「{{name}}」将被删除，确认？',
    edit_name: '更改情景模式名称',
    help:
      '每个情景模式相当于一套独立的设置，一些选项（带 <span style="color:#f5222d">*</span>）会随着情景模式变化。鼠标悬浮在查词面板的菜单图标上可快速切换，或者焦点选中菜单图标然后按<kbd>↓</kbd>。'
  },

  sync: {
    description: '数据同步设置。',
    start: '同步已在后台开始',
    success: '同步成功',
    failed: '同步失败',
    close_confirm: '设置未保存，关闭？',
    delete_confirm: '清空同步设置？',
    error_url: '不正确的超链接格式。',
    shanbay: {
      title: '扇贝生词本同步',
      description:
        '先去 shanbay.com 登录扇贝（退出后将失效）。开启后将单向同步到扇贝生词本（只从沙拉查词到扇贝），只同步新增单词（删除不同步），只同步单词本身（上下文等均不能同步）。生词需要扇贝单词库支持才能被添加。',
      login: '将打开扇贝官网，请登录再回来重新开启。',
      sync_all: '上传现有的所有生词',
      sync_all_confirm:
        '生词本存在较多单词，将分批上传。注意短时间上传太多有可能会导致封号，且不可恢复，确定继续？',
      sync_last: '上传最近的一个生词'
    },

    webdav: {
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
      explain:
        '应用设置（包括本设置）已通过浏览器自动同步。生词本可通过本设置实现 WebDAV 同步。<a href="http://help.jianguoyun.com/?p=2064" target="_blank">参考坚果云设置</a>。',
      passwd: '密码',
      title: 'WebDAV 同步',
      url: '服务器地址',
      user: '账户'
    }
  }
}
