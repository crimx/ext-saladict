interface LocaleItem {
  en: string
  'zh-CN': string
  'zh-TW': string
  ko: string
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
        'zh-TW': '保留換行',
        ko: '줄바꿈 유지'
      },
      'keepLF-none': {
        en: 'None',
        'zh-CN': '不保留',
        'zh-TW': '不保留',
        ko: '유지 안 함'
      },
      'keepLF-all': {
        en: 'All',
        'zh-CN': '全保留',
        'zh-TW': '全保留',
        ko: '모두 유지'
      },
      'keepLF-pdf': {
        en: 'PDF',
        'zh-CN': '保留 PDF 换行',
        'zh-TW': '保留 PDF 換行',
        ko: 'PDF 줄바꿈 유지'
      },
      'keepLF-webpage': {
        en: 'Webpage',
        'zh-CN': '保留网页换行',
        'zh-TW': '保留網頁換行',
        ko: '웹페이지 줄바꿈 유지'
      },
      slInitial: {
        en: 'Source Language',
        'zh-CN': '原文显示',
        'zh-TW': '原文顯示',
        ko: '원문 표시'
      },
      'slInitial-hide': {
        en: 'Hide',
        'zh-CN': '隐藏',
        'zh-TW': '隱藏',
        ko: '숨기기'
      },
      'slInitial-collapse': {
        en: 'Collapse',
        'zh-CN': '收起',
        'zh-TW': '收起',
        ko: '접기'
      },
      'slInitial-full': {
        en: 'Full',
        'zh-CN': '完整显示',
        'zh-TW': '完整顯示',
        ko: '전체 표시'
      },
      tl: {
        en: 'Target language',
        'zh-CN': '目标语言',
        'zh-TW': '目標語言',
        ko: '번역 언어'
      },
      tl2: {
        en: 'Fallback target language',
        'zh-CN': '第二目标语言',
        'zh-TW': '第二目標語言',
        ko: '보조 번역 언어'
      },
      ...options
    },
    helps: {
      slInitial: {
        en:
          'Source language initial state. If hided can be reopened via dictionary titlebar menu.',
        'zh-CN': '原文初始显示状态。隐藏后可通过字典标题栏菜单打开。',
        'zh-TW': '原文初始顯示狀態。隱藏後可通過字典標題欄選單開啟。',
        ko:
          '원문의 초기 표시 상태입니다. 숨긴 경우 사전 제목 표시줄 메뉴에서 다시 열 수 있습니다.'
      },
      tl2: {
        en:
          'Fallback when detected languange and target language are identical.',
        'zh-CN': '如果检测的源语言与目标语言相同将自动切换第二目标语言。',
        'zh-TW': '如果檢測的源語言與目標語言相同將自動切換第二目標語言。',
        ko:
          '감지된 원문 언어와 번역 언어가 같을 경우 보조 번역 언어로 자동 전환됩니다.'
      },
      ...helps
    }
  }
}
