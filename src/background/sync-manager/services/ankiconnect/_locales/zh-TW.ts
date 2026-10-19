import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: '無法連線 Anki Connect，請確認 Anki 已在執行。',
    deck: 'Anki 中沒有找到相應牌組。',
    notetype: 'Anki 中沒有找到相應筆記型別。',
    notetype_cloze:
      '該筆記型別不是克漏字（Cloze）型別，無法新增單詞。請先備份 Anki 資料，再建立包含沙拉所需欄位和範本的 Cloze 筆記型別，並在 Anki 瀏覽視窗中透過「筆記 → 變更筆記型別」遷移舊筆記，核對欄位、卡片對應和複習進度。重新命名後再次檢查只會建立新型別，不會遷移舊筆記。請勿刪除仍有筆記的舊型別，以免遺失筆記和複習進度。',
    add: '新增單詞到 Anki 失敗。'
  }
}
