export const locale = {
  title: 'Anki Connect',
  error: {
    server: '无法连接 Anki Connect，请确认 Anki 已在运行。',
    deck: 'Anki 中没有找到相应牌组。',
    notetype: 'Anki 中没有找到相应笔记类型。',
    notetype_cloze:
      '该笔记类型不是填空（Cloze）类型，无法添加单词。请先备份 Anki 数据，再创建包含沙拉所需字段和模板的 Cloze 笔记类型，并在 Anki 浏览窗口中通过“笔记 → 更改笔记类型”迁移旧笔记，核对字段、卡片映射和复习进度。重命名后重新检查只会创建新类型，不会迁移旧笔记。请勿删除仍有笔记的旧类型，以免丢失笔记和复习进度。',
    add: '添加单词到 Anki 失败。'
  }
}
