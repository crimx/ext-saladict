import { locale as _locale } from '../zh-CN/content'

export const locale: typeof _locale = {
  chooseLang: '-選擇其它語言-',
  standalone: '沙拉查詞-獨立查詞視窗',
  fetchLangList: '取得全部語言清單',
  transContext: '重新翻譯',
  neverShow: '不再彈出',
  fromSaladict: '来自沙拉查詞介面',
  tip: {
    historyBack: '上一個查單字記錄',
    historyNext: '下一個查單字記錄',
    searchText: '查單字',
    openOptions: '開啟設定',
    addToNotebook: '儲存單字到單字本，右点击開啟單字本',
    openNotebook: '開啟單字本',
    openHistory: '開啟查單字記錄',
    shareImg: '以圖片方式分享查單字結果',
    pinPanel: '釘選字典視窗',
    closePanel: '關閉字典視窗',
    sidebar: '切換側邊欄模式，右點選切換右側',
    focusPanel: '查詞時面板獲取焦點',
    unfocusPanel: '查詞時面板不獲取焦點'
  },
  wordEditor: {
    title: '儲存到單字本',
    wordCardsTitle: '單字本其它記錄',
    deleteConfirm: '從單字本中移除？',
    closeConfirm: '記錄尚未儲存，確定關閉？',
    chooseCtxTitle: '選擇翻譯結果',
    ctxHelp:
      '如需相容選擇翻譯結果以及 Anki 生成表格請保持 [:: xxx ::] 和 --------------- 格式。'
  },
  machineTrans: {
    switch: '變更語言',
    sl: '來源語言',
    tl: '目標語言',
    auto: '偵測語言',
    stext: '原文',
    showSl: '顯示原文',
    copySrc: '複製原文',
    copyTrans: '複製譯文',
    login: '請登入{詞典帳號}以使用。',
    dictAccount: '詞典帳號'
  },
  updateAnki: {
    title: '更新到 Anki',
    success: '更新到 Anki 成功。',
    failed: '更新單詞到 Anki 失敗。'
  }
}
