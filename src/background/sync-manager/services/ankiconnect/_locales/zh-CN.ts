export const locale = {
  title: 'Anki Connect',
  error: {
    server: '无法连接 Anki Connect，请确认 Anki 已在运行。',
    deck: 'Anki 中没有找到相应牌组。',
    notetype: 'Anki 中没有找到相应笔记类型。',
    notetype_cloze:
      '该笔记类型需要升级为填空（Cloze）类型。请在 Anki Connect 设置中点击“检查 Anki Connect”，按提示备份并迁移。',
    migration_unsupported:
      '自动迁移需要支持新版迁移接口的 AnkiConnect，请先更新 AnkiConnect 并重启 Anki。',
    migration_manual:
      '该类型包含自定义模板、多张卡片、筛选牌组或异常填空内容，无法自动迁移。请备份后在 Anki 中使用“更改笔记类型”，核对字段、卡片映射和复习进度。',
    migration_target_exists:
      '对应的 Cloze 类型已存在，可能有上次迁移的结果。请在 Anki 中核对后在设置中选择该类型；自动迁移不会覆盖它。',
    migration_changed:
      'Anki 数据或用户配置已改变。请停止编辑和复习，重新检查后再迁移。',
    migration_backup:
      '备份未确认成功，迁移已停止。请检查 Anki 用户目录的可用空间和写入权限。',
    migration_verify:
      '迁移结果未通过核对。请保留备份，在 Anki 中检查笔记、卡片和复习进度后再继续。',
    add: '添加单词到 Anki 失败。'
  },
  migration: {
    title: '将旧笔记类型升级为 Cloze',
    action: '备份并迁移',
    confirm:
      '将迁移所有使用“{{noteType}}”的 {{count}} 条笔记，涉及 {{decks}} 个牌组。沙拉会先备份这些牌组（含学习进度），再创建“{{target}}”并迁移。核对成功后会自动保存并切换笔记类型，旧类型会保留。',
    backup_location:
      '备份文件保存在运行 Anki 的电脑上，位于当前 Anki 用户目录中、collection.media 文件夹旁。不上传到 AnkiWeb。没有旧笔记时只创建新类型，无需导出牌组。',
    running: '正在备份并迁移。请保持 Anki 运行，不要切换用户、编辑笔记或复习。',
    backups: '已完成的备份文件：',
    failure_help:
      '旧类型和已完成的备份会保留。如果新类型已创建，部分操作可能已完成；请先在 Anki 中核对，不要删除类型或重复迁移。',
    success: '笔记类型迁移完成',
    success_help:
      '已切换到“{{target}}”，原卡片和复习进度已核对。备份文件：{{paths}}',
    no_backup: '原类型没有笔记，未生成牌组备份。'
  }
}
