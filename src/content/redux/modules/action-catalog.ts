import { AppConfig, DictID } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { Message } from '@/typings/message'
import { Word } from '@/_helpers/record-manager'

export type ActionCatalog = {
  NEW_CONFIG: {
    payload: AppConfig
  }

  NEW_PROFILE: {
    payload: Profile
  }

  NEW_SELECTION: {
    payload: Message<'SELECTION'>['payload']
  }

  /** Is App temporary disabled */
  TEMP_DISABLED_STATE: {
    payload: boolean
  }

  /** Click or hover on salad bowl */
  BOWL_ACTIVATED: {}

  /* ------------------------------------------------ *\
     Dict Panel
  \* ------------------------------------------------ */

  CLOSE_PANEL: {}

  /** Is current word in Notebook */
  WORD_IN_NOTEBOOK: {
    payload: boolean
  }

  SEARCH_START: {
    payload?: {
      /** Search with specific dict */
      id?: DictID
      /** Search specific word */
      word?: Word
      /** Additional payload passed to search engine */
      payload?: any
    }
  }

  SEARCH_END: {
    payload: {
      id: DictID
      result: any
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
}
