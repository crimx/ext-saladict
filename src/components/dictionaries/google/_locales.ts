import { getMachineLocales } from '../locales'

export const locales = getMachineLocales(
  {
    en: 'Google Translation',
    'zh-CN': '谷歌翻译',
    'zh-TW': '谷歌翻譯'
  },
  {
    cnfirst: {
      en: 'Use google.cn first',
      'zh-CN': '优先使用 google.cn',
      'zh-TW': '優先使用 google.cn'
    },
    concurrent: {
      en: 'Search concurrently',
      'zh-CN': '并行查询',
      'zh-TW': '並行查詢'
    }
  },
  {
    concurrent: {
      en: 'Search .com and .cn concurrently',
      'zh-CN': '同时搜索 .com 和 .cn 取最先返回的结果',
      'zh-TW': '同時搜尋 .com 和 .cn 取最先返回的結果'
    }
  }
)
