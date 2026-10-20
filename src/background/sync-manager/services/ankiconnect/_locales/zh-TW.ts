import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: '無法連線 Anki Connect，請確認 Anki 已在執行。',
    deck: 'Anki 中沒有找到相應牌組。',
    notetype: 'Anki 中沒有找到相應筆記型別。',
    notetype_cloze:
      '該筆記型別需要升級為克漏字（Cloze）型別。請在 Anki Connect 設定中點擊「檢查 Anki Connect」，依提示備份並遷移。',
    migration_unsupported:
      '自動遷移需要支援新版遷移介面的 AnkiConnect。請先更新 AnkiConnect 並重新啟動 Anki。',
    migration_manual:
      '該型別包含自訂範本、多張卡片、篩選牌組或異常克漏字內容，無法自動遷移。請備份後在 Anki 中使用「變更筆記型別」，核對欄位、卡片對應和複習進度。',
    migration_target_exists:
      '對應的 Cloze 型別已存在，可能是上次遷移的結果。請在 Anki 中核對後在設定中選擇該型別；自動遷移不會覆寫它。',
    migration_changed:
      'Anki 資料或使用者設定已改變。請停止編輯和複習，重新檢查後再遷移。',
    migration_backup:
      '備份未確認成功，遷移已停止。請檢查 Anki 使用者目錄的可用空間和寫入權限。',
    migration_verify:
      '遷移結果未通過核對。請保留備份，在 Anki 中檢查筆記、卡片和複習進度後再繼續。',
    add: '新增單詞到 Anki 失敗。'
  },
  migration: {
    title: '將舊筆記型別升級為 Cloze',
    action: '備份並遷移',
    confirm:
      '將遷移所有使用「{{noteType}}」的 {{count}} 則筆記，涉及 {{decks}} 個牌組。沙拉會先備份這些牌組（含學習進度），再建立「{{target}}」並遷移。核對成功後會自動儲存並切換筆記型別，舊型別會保留。',
    backup_location:
      '備份檔案儲存在執行 Anki 的電腦上，位於目前 Anki 使用者目錄中、collection.media 資料夾旁。不會上傳至 AnkiWeb。沒有舊筆記時只建立新型別，無需匯出牌組。',
    running:
      '正在備份並遷移。請保持 Anki 執行，不要切換使用者、編輯筆記或複習。',
    backups: '已完成的備份檔案：',
    failure_help:
      '舊型別和已完成的備份會保留。如果新型別已建立，部分操作可能已完成；請先在 Anki 中核對，不要刪除型別或重複遷移。',
    success: '筆記型別遷移完成',
    success_help:
      '已切換至「{{target}}」，原卡片和複習進度已核對。備份檔案：{{paths}}',
    no_backup: '原型別沒有筆記，未產生牌組備份。'
  }
}
