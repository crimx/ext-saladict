import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: '無法連線 Anki Connect，請確認 Anki 已在執行。',
    deck: 'Anki 中沒有找到相應牌組。',
    notetype: 'Anki 中沒有找到相應筆記型別。',
    notetype_cloze:
      '該筆記型別不是克漏字（Cloze）型別，Anki 會拒絕新增單詞。請在 Anki 中刪除或重新命名該筆記型別後重新檢查以自動建立，或改用一個克漏字型別的筆記型別。',
    add: '新增單詞到 Anki 失敗。'
  }
}
