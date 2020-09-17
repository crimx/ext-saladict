import { locale as _locale } from '../zh-CN/content'

export const locale: typeof _locale = {
  chooseLang: 'Choose another language',
  standalone: 'Saladict Standalone Panel',
  fetchLangList: 'Fetch full language list',
  transContext: 'Retranslate',
  neverShow: 'Stop showing',
  fromSaladict: 'From Saladict Panel',
  tip: {
    historyBack: 'Previous search history',
    historyNext: 'Next search history',
    searchText: 'Search text',
    openOptions: 'Open Options',
    addToNotebook: 'Add to Notebook. Right click to open Notebook',
    openNotebook: 'Open Notebook',
    openHistory: 'Open History',
    shareImg: 'Share as image',
    pinPanel: 'Pin the panel',
    closePanel: 'Close the panel',
    sidebar: 'Switch to sidebar mode. Right click to right side.',
    focusPanel: 'Panel gains focus when searching',
    unfocusPanel: 'Panel does not gain focus when searching'
  },
  wordEditor: {
    title: 'Add to Notebook',
    wordCardsTitle: 'Other results from Notebook',
    deleteConfirm: 'Delete from Notebook?',
    closeConfirm: 'Changes will not be saved. Are you sure to close?',
    chooseCtxTitle: 'Pick translated results',
    ctxHelp:
      'Keep the [:: xxx ::] and --------------- format if you want Saladict to handle translation selection and generate Anki table.'
  },
  machineTrans: {
    switch: 'Switch Language',
    sl: 'Source Language',
    tl: 'Target Language',
    auto: 'Detect language',
    stext: 'Original',
    showSl: 'Show Source',
    copySrc: 'Copy Source',
    copyTrans: 'Copy Translation',
    login: 'Please provide {access token}.',
    dictAccount: 'access token'
  },
  updateAnki: {
    title: 'Update to Anki',
    success: 'Successfully update word to Anki.',
    failed: 'Failed to update word to Anki.'
  }
}
