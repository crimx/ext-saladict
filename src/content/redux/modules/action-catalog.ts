import { CreateActionCatalog } from 'retux'
import { AppConfig, DictID } from '@/app-config'
import { Profile, ProfileIDList } from '@/app-config/profiles'
import { Message } from '@/typings/message'
import { Word } from '@/_helpers/record-manager'
import { DictSearchResult } from '@/components/dictionaries/helpers'

export type ActionCatalog = CreateActionCatalog<{
  NEW_CONFIG: {
    payload: AppConfig
  }

  NEW_PROFILES: {
    payload: ProfileIDList
  }

  NEW_ACTIVE_PROFILE: {
    payload: Profile
  }

  NEW_SELECTION: {
    payload: Message<'SELECTION'>['payload']
  }

  WINDOW_RESIZE: {}

  /** Is App temporary disabled */
  TEMP_DISABLED_STATE: {
    payload: boolean
  }

  /** Click or hover on salad bowl */
  BOWL_ACTIVATED: {}

  /* ------------------------------------------------ *\
     Dict Panel
  \* ------------------------------------------------ */

  UPDATE_TEXT: {
    payload: string
  }

  TOGGLE_MTA_BOX: {}

  TOGGLE_WAVEFORM_BOX: {}

  TOGGLE_PIN: {}

  /** Focus button on quick search panel */
  TOGGLE_QS_FOCUS: {}

  OPEN_PANEL: {
    payload: {
      x: number
      y: number
    }
  }

  CLOSE_PANEL: {}

  SWITCH_HISTORY: {
    payload: 'prev' | 'next'
  }

  /** Is current word in Notebook */
  WORD_IN_NOTEBOOK: {
    payload: boolean
  }

  // Add the latest history item to Notebook
  ADD_TO_NOTEBOOK: {}

  SEARCH_START: {
    payload?: {
      /** Search with specific dict */
      id?: DictID
      /** Search specific word */
      word?: Word
      /** Additional payload passed to search engine */
      payload?: any
      /** Do not update search history */
      noHistory?: boolean
    }
  }

  SEARCH_END: {
    payload: {
      id: DictID
      result: any
      catalog?: DictSearchResult<DictID>['catalog']
    }
  }

  UPDATE_PANEL_HEIGHT: {
    payload: {
      area: 'menubar' | 'mtabox' | 'dictlist' | 'waveformbox'
      height: number
      /** independent layer */
      floatHeight?: number
    }
  }

  /** User manually folds or unfolds dict item */
  USER_FOLD_DICT: {
    payload: {
      id: DictID
      fold: boolean
    }
  }

  DRAG_START_COORD: {
    payload: null | {
      x: number
      y: number
    }
  }

  /* ------------------------------------------------ *\
    Quick Search Dict Panel
  \* ------------------------------------------------ */

  SUMMONED_PANEL_INIT: {
    /** search text */
    payload: string
  }

  QS_PANEL_CHANGED: {
    payload: boolean
  }

  OPEN_QS_PANEL: {}

  /* ------------------------------------------------ *\
     Word Editor Panel
  \* ------------------------------------------------ */

  WORD_EDITOR_STATUS: {
    payload: {
      word: Word | null
      /** translate context when word editor shows */
      translateCtx?: boolean
    }
  }

  /* ------------------------------------------------ *\
     Others
  \* ------------------------------------------------ */

  PLAY_AUDIO: {
    payload: {
      src: string
      timestamp: number
    }
  }
}>
