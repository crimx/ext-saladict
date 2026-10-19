import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Cannot connect to Anki Connect. Please make sure Anki is running.',
    deck: 'Deck not found in Anki.',
    notetype: 'Note type not found in Anki.',
    notetype_cloze:
      'This note type is not Cloze, so new words cannot be added. Back up Anki, create a Cloze note type with the fields and templates required by Saladict, and migrate existing notes using Notes → Change Note Type in the Anki Browse window. Check field and card mappings and review progress. Renaming the old type and verifying again only creates a new type; it does not migrate existing notes. Do not delete a type that still contains notes, as this deletes those notes and their review history.',
    add: 'Failed to add word to Anki.'
  }
}
