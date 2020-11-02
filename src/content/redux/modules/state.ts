import { PromiseType } from 'utility-types'
import { newWord, Word } from '@/_helpers/record-manager'
import { DictID } from '@/app-config'
import { getConfig } from '@/_helpers/config-manager'
import { getProfileIDList, getActiveProfile } from '@/_helpers/profile-manager'
import {
  isQuickSearchPage,
  isStandalonePage,
  isOptionsPage,
  isPopupPage
} from '@/_helpers/saladict'
import { DictSearchResult } from '@/components/dictionaries/helpers'

export const initState = async () => {
  const pConfig = getConfig()
  const pProfiles = getProfileIDList()
  const pActiveProfile = getActiveProfile()

  const config = await pConfig
  const profiles = await pProfiles
  const activeProfile = await pActiveProfile

  const url = window.location.href

  const isShowMtaBox = activeProfile.mtaAutoUnfold !== 'hide'

  return {
    config,
    profiles,
    activeProfile,
    selection: {
      word: newWord() as Word | null,
      mouseX: 0,
      mouseY: 0,
      self: false,
      dbClick: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      instant: false,
      force: false
    },
    /** Temporary disable Saladict */
    isTempDisabled:
      config.blacklist.some(([r]) => new RegExp(r).test(url)) &&
      config.whitelist.every(([r]) => !new RegExp(r).test(url)),
    /**
     * Is current panel a Quick Search Panel,
     * which could be in a standalone window or in-page element.
     */
    isQSPanel: isQuickSearchPage(),
    isQSFocus: config.qsFocus,
    /** is a standalone quick search panel running */
    withQssaPanel: false,
    wordEditor: {
      isShow: false,
      word: newWord(),
      // translate context on start
      translateCtx: false
    },
    isShowBowl: false,
    isShowDictPanel: isStandalonePage(),
    isShowMtaBox,
    isExpandMtaBox:
      isShowMtaBox &&
      (activeProfile.mtaAutoUnfold === 'once' ||
        activeProfile.mtaAutoUnfold === 'always' ||
        (activeProfile.mtaAutoUnfold === 'popup' && isPopupPage())),
    isExpandWaveformBox: false,
    isPinned: false,
    /** Is current word in Notebook */
    isFav: false,
    bowlCoord: { x: 0, y: 0 },
    /** The actual coord of dict panel might be different */
    dictPanelCoord: isOptionsPage()
      ? { x: window.innerWidth - config.panelWidth - 20, y: 80 }
      : { x: 0, y: 0 },
    panelHeight: 30,
    _panelHeightCache: {
      menubar: 30,
      mtabox: 0,
      dictlist: 0,
      waveformbox: 0,
      sum: 30,
      /** independent layer */
      floatHeight: 0
    },
    panelMaxHeight: (window.innerHeight * config.panelMaxHeightRatio) / 100,
    /** Dicts that will be rendered to dict panel */
    renderedDicts: [] as {
      readonly id: DictID
      readonly searchStatus: 'IDLE' | 'SEARCHING' | 'FINISH'
      readonly searchResult: any
      readonly catalog?: DictSearchResult<DictID>['catalog']
    }[],
    /** User manually folded or unfolded */
    userFoldedDicts: {} as { [id in DictID]?: boolean },
    /** Search text */
    text: '',
    /** 0 is the oldest */
    searchHistory: [] as Word[],
    /** User can view back search history */
    historyIndex: -1,
    /** Record init coordinate on dragstart */
    dragStartCoord: null as null | { x: number; y: number },
    lastPlayAudio: null as null | { src: string; timestamp: number }
  }
}

export type State = PromiseType<ReturnType<typeof initState>>

export default initState
