import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Cannot connect to Anki Connect. Please make sure Anki is running.',
    deck: 'Deck not found in Anki.',
    notetype: 'Note type not found in Anki.',
    notetype_cloze:
      'This note type needs to be upgraded to Cloze. Open Anki Connect settings and click Verify to back up and migrate it.',
    migration_unsupported:
      'Automatic migration requires the newer AnkiConnect migration API. Update AnkiConnect and restart Anki.',
    migration_manual:
      'Custom templates, multiple cards, filtered decks or unsupported Cloze content prevent automatic migration. Back up your data and use Change Note Type in Anki, checking field and card mappings and review progress.',
    migration_target_exists:
      'The corresponding Cloze type already exists, possibly from an interrupted migration. Check it in Anki and select it in settings. Automatic migration will not overwrite it.',
    migration_changed:
      'Anki data or the active profile changed. Stop editing and reviewing, then verify again before migrating.',
    migration_backup:
      'The backup could not be confirmed, so migration stopped. Check free space and write permissions in the Anki profile directory.',
    migration_verify:
      'Migration results could not be verified. Keep the backups and check notes, cards and review progress in Anki before continuing.',
    add: 'Failed to add word to Anki.'
  },
  migration: {
    title: 'Upgrade the old note type to Cloze',
    action: 'Back up and migrate',
    confirm:
      'Migrate all {{count}} notes using “{{noteType}}” across {{decks}} decks. Saladict will back up these decks with scheduling, create “{{target}}”, and migrate the notes. After verification, it will save and switch the configured note type. The old type will be kept.',
    backup_location:
      'Backups are saved on the computer running Anki, in the current profile directory beside collection.media. Nothing is uploaded to AnkiWeb. If there are no old notes, only the new type is created; no deck backup is needed.',
    running:
      'Backing up and migrating. Keep Anki open and do not switch profiles, edit notes or review cards.',
    backups: 'Completed backup files:',
    failure_help:
      'The old type and completed backups are kept. Some operations may have completed if the new type exists. Check it in Anki before deleting types or attempting another migration.',
    success: 'Note type migration complete',
    success_help:
      'Switched to “{{target}}”. Existing cards and scheduling were verified. Backups: {{paths}}',
    no_backup: 'The old type had no notes, so no deck backup was created.'
  }
}
