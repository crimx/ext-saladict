import { locale as _locale } from '../zh-CN/wordpage'

export const locale: typeof _locale = {
  title: {
    history: 'Saladict Search History (local)',
    notebook: 'Saladict Notebook (local)'
  },

  column: {
    add: 'Add',
    date: 'Date',
    edit: 'Edit',
    note: 'Note',
    source: 'Source',
    trans: 'Translation',
    word: 'Word'
  },

  delete: {
    title: 'Delete words',
    all: 'Delete all',
    confirm: '. Confirm?',
    page: 'Delete page',
    selected: 'Delete selected'
  },

  export: {
    title: 'Export as text',
    all: 'Export all',
    description: 'Describe the shape of each record: ',
    explain: 'How to export to ANKI and other tools',
    gencontent: 'Generated Content',
    linebreak: {
      default: 'Keep default linebreaks',
      n: 'replace linebreaks with \\n',
      br: 'replace linebreaks with <br>',
      p: 'replace linebreaks with <p>'
    },
    page: 'Export page',
    placeholder: 'Placeholder',
    selected: 'Export selected'
  },

  filterWord: {
    chs: 'Chinese',
    eng: 'English',
    word: 'Word',
    phrase: 'Phrase'
  },

  wordCount: {
    selected: '{{count}} item selected',
    selected_plural: '{{count}} item selected',
    total: '{{count}} item total',
    total_plural: '{{count}} item total'
  }
}
