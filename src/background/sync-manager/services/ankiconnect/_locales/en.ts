import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Cannot connect to Anki Connect. Please make sure Anki is running.',
    deck: 'Deck not found in Anki.',
    notetype: 'Note type not found in Anki.',
    add: 'Failed to add word to Anki.'
  }
}
