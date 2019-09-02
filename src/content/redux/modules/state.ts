import { newWord, Word } from '@/_helpers/record-manager'
import { getDefaultConfig, DictID } from '@/app-config'
import { getDefaultProfile, ProfileIDList } from '@/app-config/profiles'
import {
  isQuickSearchPage,
  isStandalonePage,
  isOptionsPage
} from '@/_helpers/saladict'

export const initState = () => ({
  config: getDefaultConfig(),
  profiles: [] as ProfileIDList,
  activeProfile: getDefaultProfile(),
  selection: {
    word: newWord() as Word | null,
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
  /** Temporary disable Saladict */
  isTempDisabled: false,
  /** Is current panel a Quick Search Panel */
  isQSPanel: isQuickSearchPage(),
  /** is a standalone quick search panel running */
  withQSPanel: false,
  isShowWordEditor: false,
  isShowBowl: false,
  isShowDictPanel: isStandalonePage() || isOptionsPage(),
  isExpandMtaBox: false,
  isPinned: isOptionsPage(),
  /** Is current word in Notebook */
  isFav: false,
  /** Pass negative value to skip the reconciliation */
  dictPanelCoord: {
    mouseX: 0,
    mouseY: 0
  },
  panelMaxHeight: window.innerHeight * 0.8,
  panelMinHeight: 0,
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
  historyIndex: 0,
  /** Record init coordinate on dragstart */
  dragStartCoord: null as null | { x: number; y: number }
})

export default initState
