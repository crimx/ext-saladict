import { Word, DBArea } from '@/_helpers/record-manager'
import { DictID } from '@/app-config'
import { DictSearchResult } from '@/components/dictionaries/helpers'

type MessageConfigType<
  T extends {
    [type in string]: { [key in 'payload' | 'response']?: any }
  }
> = T

export type MessageConfig = MessageConfigType<{
  /* ------------------------------------------------ *\
     Backend - From other pages to background script
  \* ------------------------------------------------ */

  /** Open url in new tab or update existing tab */
  OPEN_URL: {
    payload: {
      url: string
      /** use browser.runtime.getURL? */
      self?: boolean
    }
  }

  /** Open the source page of a dictionary */
  OPEN_DICT_SRC_PAGE: {
    payload: {
      id: DictID
      text: string
    }
  }

  /** Get clipboard content */
  GET_CLIPBOARD: {
    response: string
  }

  /** Request backend for page info */
  PAGE_INFO: {
    response: {
      pageId: string | number
      faviconURL?: string
      pageTitle?: string
      pageURL?: string
    }
  }

  /** Request backend to fetch suggest */
  GET_SUGGESTS: {
    /** Search text */
    payload: string
    /** Response with suggest items */
    response: Array<{
      explain: string
      entry: string
    }>
  }

  FETCH_DICT_RESULT: {
    payload: {
      id: DictID
      text: string
      /** engine search function payload */
      payload: {
        isPDF: boolean
        [index: string]: any
      }
    }
    response: {
      id: DictID
      result: any
      audio?: DictSearchResult<DictID>['audio']
    }
  }

  /** call any method exported from the engine */
  DICT_ENGINE_METHOD: {
    payload: {
      id: DictID
      method: string
      args?: any[]
    }
    response: any
  }

  /** Inject dict panel to any page */
  INJECT_DICTPANEL: {}

  /* ------------------------------------------------ *\
     Backend IndexedDB: Notebook or History
  \* ------------------------------------------------ */

  /** Is a word in Notebook */
  IS_IN_NOTEBOOK: {
    payload: Word
    response: boolean
  }

  /** Save a word to Notebook or History */
  SAVE_WORD: {
    payload: {
      area: DBArea
      word: Word
      /** From sync services */
      fromSync?: boolean
    }
  }

  WORD_SAVED: {}

  DELETE_WORDS: {
    payload: {
      area: DBArea
      dates?: number[]
    }
  }

  GET_WORDS_BY_TEXT: {
    payload: {
      area: DBArea
      text: string
    }
    response: Word[]
  }

  GET_WORDS: {
    payload: {
      area: DBArea
      itemsPerPage?: number
      pageNum?: number
      filters?: { [field: string]: string[] | undefined }
      sortField?: string
      sortOrder?: 'ascend' | 'descend' | false
      searchText?: string
    }
    response: {
      total: number
      words: Word[]
    }
  }

  /* ------------------------------------------------ *\
     Audio Playing
  \* ------------------------------------------------ */

  PLAY_AUDIO: {
    /** url: to backend */
    payload: string
  }

  LAST_PLAY_AUDIO: {
    response?: null | { src: string; timestamp: number }
  }

  /* ------------------------------------------------ *\
     Text Selection
  \* ------------------------------------------------ */

  /** To dict panel */
  SELECTION: {
    payload: {
      word: Word | null
      mouseX: number
      mouseY: number
      dbClick: boolean
      shiftKey: boolean
      ctrlKey: boolean
      metaKey: boolean
      /** inside panel? */
      self: boolean
      /** skip salad bowl and show panel directly */
      instant: boolean
      /** force panel to skip reconciling position */
      force: boolean
    }
  }

  /** send to the current active tab for selection */
  PRELOAD_SELECTION: {
    response: Word
  }

  /** Manually emit selection */
  EMIT_SELECTION: {}

  ESCAPE_KEY: {}

  /** Ctrl/Command has been hit 3 times */
  TRIPLE_CTRL: {}

  /* ------------------------------------------------ *\
     Dict Panel
  \* ------------------------------------------------ */

  /** From dict panel when it is pinned or unpinned */
  PIN_STATE: {
    payload: boolean
  }

  /** Other pages or frames query for panel state */
  QUERY_PANEL_STATE: {
    /** object path, default returns the whole state */
    payload?: string
    response?: any
  }

  /** request searching */
  SEARCH_TEXT: {
    payload: Word
  }

  TEMP_DISABLED_STATE: {
    payload:
      | {
          op: 'get'
        }
      | {
          op: 'set'
          value: boolean
        }
    response: boolean
  }

  /** Info for brwoser action badge. From background to content. */
  GET_TAB_BADGE_INFO: {
    response: {
      active: boolean
      tempDisable: boolean
      unsupported: boolean
    }
  }

  /** Info for brwoser action badge. From content to background. */
  SEND_TAB_BADGE_INFO: {
    payload: {
      active: boolean
      tempDisable: boolean
      unsupported: boolean
    }
  }

  /* ------------------------------------------------ *\
    Quick Search Dict Panel
  \* ------------------------------------------------ */

  /** Send new words to standalone panel */
  QS_PANEL_SEARCH_TEXT: {
    payload: Word
  }

  /** Open or update Quick Search Panel */
  OPEN_QS_PANEL: {}

  CLOSE_QS_PANEL: {}

  /** query backend for standalone panel appearance */
  QUERY_QS_PANEL: {
    response: boolean
  }

  /** Fired from backend when standalone panel show or hide */
  QS_PANEL_CHANGED: {
    payload: boolean
  }

  /** Focus standalone quick search panel */
  QS_PANEL_FOCUSED: {}

  /** Switch to Sidebar */
  QS_SWITCH_SIDEBAR: {
    payload: 'left' | 'right'
  }

  /* ------------------------------------------------ *\
     Word Editor
  \* ------------------------------------------------ */

  UPDATE_WORD_EDITOR_WORD: {
    payload: {
      word: Word
      translateCtx?: boolean
    }
  }

  /* ------------------------------------------------ *\
     Sync services
  \* ------------------------------------------------ */

  SYNC_SERVICE_INIT: {
    payload: {
      serviceID: string
      config: any
    }
  }

  SYNC_SERVICE_DOWNLOAD: {
    payload?: {
      serviceID: string
      noCache?: boolean
    }
  }

  SYNC_SERVICE_UPLOAD: {
    payload:
      | {
          op: 'ADD'
          /** If not provided, call all services */
          serviceID?: string
          /** If not provided, upload all words */
          words?: Word[]
          /** full sync anyway */
          force?: boolean
        }
      | {
          op: 'DELETE'
          /** If not provided, call all services */
          serviceID?: string
          dates?: number[]
          /** full sync anyway */
          force?: boolean
        }
  }

  /* ------------------------------------------------ *\
     Context Menus
  \* ------------------------------------------------ */

  /** Manually trigger context menus click */
  CONTEXT_MENUS_CLICK: {
    payload: {
      menuItemId: string
      selectionText?: string
      linkUrl?: string
    }
  }

  /* ------------------------------------------------ *\
     Third-party Scripts
  \* ------------------------------------------------ */

  YOUDAO_TRANSLATE_AJAX: {
    payload: any
    response: any
  }
}>

export type MsgType = keyof MessageConfig

// 'extends' hack to generate union
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
export type Message<T extends MsgType = MsgType> = T extends any
  ? Readonly<
      {
        type: T
      } & ('payload' extends keyof MessageConfig[T]
        ? Pick<MessageConfig[T], Extract<'payload', keyof MessageConfig[T]>>
        : { payload?: null })
    >
  : never

export type MessageResponse<T extends MsgType> = Readonly<
  'response' extends keyof MessageConfig[T]
    ? MessageConfig[T][Extract<'response', keyof MessageConfig[T]>]
    : void
>
