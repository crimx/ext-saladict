interface LocaleItem {
  en: string
  'zh-CN': string
  'zh-TW': string
}

interface LocaleObject {
  [name: string]: LocaleItem
}

export function getMachineLocales(
  name: LocaleItem,
  options: LocaleObject = {},
  helps: LocaleObject = {}
): {
  name: LocaleItem
  options: LocaleObject
  helps: LocaleObject
} {
  return {
    name,
    options: {
      keepLF: {
        en: 'Keep linebreaks',
        'zh-CN': '保留换行',
        'zh-TW': '保留換行'
      },
      'keepLF-none': {
        en: 'None',
        'zh-CN': '不保留',
        'zh-TW': '不保留'
      },
      'keepLF-all': {
        en: 'All',
        'zh-CN': '全保留',
        'zh-TW': '全保留'
      },
      'keepLF-pdf': {
        en: 'PDF',
        'zh-CN': '保留 PDF 换行',
        'zh-TW': '保留 PDF 換行'
      },
      'keepLF-webpage': {
        en: 'Webpage',
        'zh-CN': '保留网页换行',
        'zh-TW': '保留網頁換行'
      },
      slInitial: {
        en: 'Source Language',
        'zh-CN': '原文显示',
        'zh-TW': '原文顯示'
      },
      'slInitial-hide': {
        en: 'Hide',
        'zh-CN': '隐藏',
        'zh-TW': '隱藏'
      },
      'slInitial-collapse': {
        en: 'Collapse',
        'zh-CN': '收起',
        'zh-TW': '收起'
      },
      'slInitial-full': {
        en: 'Full',
        'zh-CN': '完整显示',
        'zh-TW': '完整顯示'
      },
      tl: {
        en: 'Target language',
        'zh-CN': '目标语言',
        'zh-TW': '目標語言'
      },
      tl2: {
        en: 'Fallback target language',
        'zh-CN': '第二目标语言',
        'zh-TW': '第二目標語言'
      },
      ...options
    },
    helps: {
      slInitial: {
        en:
          'Source language initial state. If hided can be reopened via dictionary titlebar menu.',
        'zh-CN': '原文初始显示状态。隐藏后可通过字典标题栏菜单打开。',
        'zh-TW': '原文初始顯示狀態。隱藏後可通過字典標題欄選單開啟。'
      },
      tl2: {
        en:
          'Fallback when detected languange and target language are identical.',
        'zh-CN': '如果检测的源语言与目标语言相同将自动切换第二目标语言。',
        'zh-TW': '如果檢測的源語言與目標語言相同將自動切換第二目標語言。'
      },
      ...helps
    }
  }
}
