import { newWord, Word } from '@/_helpers/record-manager'
import { getDefaultConfig, DictID } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

export const initState = {
  activeProfile: getDefaultProfile(),
  config: getDefaultConfig(),
  selection: {
    word: newWord(),
    mouseX: 0,
    mouseY: 0,
    self: false,
    dbClick: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    instant: false,
    force: false
  },
  isShowBowl: false,
  isShowDictPanel: false,
  /** Temporary disable Saladict */
  isTempDisabled: false,
  isPinned: false,
  /** is a standalone quick search panel running */
  withQSPanel: false,
  /** Is current word in Notebook */
  isFav: false,
  /** Pass negative value to skip the reconciliation */
  dictPanelCord: {
    mouseX: 0,
    mouseY: 0
  },
  /** Dicts that will be rendered to dict panel */
  renderedDicts: [] as {
    readonly id: DictID
    readonly searchStatus: 'IDLE' | 'SEARCHING' | 'FINISH'
    readonly searchResult: any
  }[],
  /** Search text */
  text: '',
  /** 0 is the oldest */
  searchHistory: [] as Word[],
  /** User can view back search history */
  historyIndex: 0
}

export default initState
