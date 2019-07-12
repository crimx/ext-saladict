import { locale as _locale } from '../zh-CN/wordpage'

export const locale: typeof _locale = {
  title: {
    history: 'Saladict 查單字紀錄（僅本機儲存）',
    notebook: 'Saladict 生字本（僅本機儲存）'
  },

  column: {
    add: '新增',
    date: '日期',
    edit: '編輯',
    note: '筆記',
    source: '來源',
    trans: '翻譯',
    word: '單字'
  },

  delete: {
    title: '刪除單字',
    all: '刪除所有單字',
    confirm: '，確認？',
    page: '刪除本頁單字',
    selected: '刪除選取單字'
  },

  export: {
    title: '匯出文字',
    all: '匯出所有單字',
    description: '編寫產生的範本，描述每條記錄產生的樣子：',
    explain: '如何配合 ANKI 等工具',
    gencontent: '代表的內容',
    page: '輸出本頁單字',
    placeholder: '預留位置',
    selected: '輸出選中單字'
  },

  filterWord: {
    chs: '中文',
    eng: '英文',
    word: '單字',
    phrase: '片語和句子'
  },

  wordCount: {
    selected: '已選中 {{count}} 個單字',
    selected_plural: '已選中 {{count}} 個單字',
    total: '共有 {{count}} 個單字',
    total_plural: '共有 {{count}} 個單字'
  }
}
