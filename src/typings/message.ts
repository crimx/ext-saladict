import { Word, DBArea } from '@/_helpers/record-manager'
// import { DictID } from '@/app-config'
// import { Word, Area as DBArea } from '@/_helpers/record-manager'
import { DictID } from '@/app-config'
import { DictSearchResult } from '@/components/dictionaries/helpers'
// import { DictSearchResult } from '@/typings/server'

export type MessageConfig = {
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
    }
  }

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
  }

  /* ------------------------------------------------ *\
     Audio Playing
  \* ------------------------------------------------ */

  PLAY_AUDIO: {
    /** url: to backend */
    payload: string
  }

  WAVEFORM_PLAY_AUDIO: {
    /** url: to waveform */
    payload: string
  }

  /** waveform to panel */
  LAST_PLAY_AUDIO: {
    /** url */
    response?: string
  }

  /* ------------------------------------------------ *\
     Text Selection
  \* ------------------------------------------------ */

  /** To dict panel */
  SELECTION: {
    payload: {
      word: Word
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
      serviceID?: string
      noCache?: boolean
    }
  }

  SYNC_SERVICE_ADD: {
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      words: Word[]
    }
  }

  SYNC_SERVICE_DELETE: {
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      dates?: number[]
      force?: boolean
    }
  }
}

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

// export enum MsgType {
//   /** Nothing */
//   Null,
//   /** Default */
//   Default,

//   /** is a standalone panel running? */
//   QSPanelIDChanged,

//   /** query background for standalone panel appearance */
//   QueryQSPanel,

//   CloseQSPanel,

//   /** Ctrl/Command has been hit 3 times */
//   TripleCtrl,

//   /** Escape key is pressed */
//   EscapeKey,

//   /** Response the pageInfo of a page */
//   PageInfo,

//   /** Background to a dict panel on one page */
//   PlayWaveform,
//   /** Request background proxy for current selection */
//   PreloadSelection,
//   /** Get clipboard content */
//   GetClipboard,

//   RequestCSS,

//   /** Popup page */
//   TempDisabledState,

//   /** Word page */
//   EditWord,

//   /** Query panel state */
//   QueryPanelState,

//   /** Manually emit selection event */
//   EmitSelection,

//   /** Manually trigger context menus click */
//   ContextMenusClick,

//   /**
//    * Background proxy sends back underlyingly
//    */
//   __PageInfo__
// }

/** iframe messaging */
// export enum PostMsgType {
//   Selection = 'SALADICT_SELECTION'
// }

// export interface MsgSelection {
//   readonly type: MsgType.Selection
//   readonly selectionInfo: SelectionInfo
//   readonly mouseX: number
//   readonly mouseY: number
//   /** inside panel? */
//   readonly self: boolean
//   readonly dbClick: boolean
//   readonly shiftKey: boolean
//   readonly ctrlKey: boolean
//   readonly metaKey: boolean
//   /** skip salad bowl and show panel directly */
//   readonly instant: boolean
//   /** force panel to skip reconciling position */
//   readonly force: boolean
// }

// export interface PostMsgSelection extends Omit<MsgSelection, 'type'> {
//   readonly type: PostMsgType.Selection
// }

// export interface MsgOpenUrl {
//   readonly type: MsgType.OpenURL
//   readonly url: string
//   /** use browser.runtime.getURL? */
//   readonly self?: boolean
// }

// export interface MsgOpenSrcPage {
//   readonly type: MsgType.OpenSrcPage
//   readonly text: string
//   readonly id: DictID
// }

// export interface MsgAudioPlay {
//   readonly type: MsgType.PlayAudio
//   /** empty string for stoping */
//   readonly src: string
// }

// export interface MsgWaveFormPlay {
//   readonly type: MsgType.PlayWaveform
//   readonly src: string
//   readonly tabId: string | number
// }

// export interface MsgFetchDictResult {
//   readonly type: MsgType.FetchDictResult
//   readonly id: DictID
//   readonly text: string
//   /** pass to engine search function as the third argument */
//   readonly payload: {
//     isPDF: boolean
//     [index: string]: any
//   }
// }

// export interface MsgFetchDictResultResponse<R = any> {
//   id: DictID
//   result: R | null
//   audio?: DictSearchResult<R>['audio']
// }

// export interface MsgDictEngineMethod {
//   readonly type: MsgType.DictEngineMethod
//   readonly id: DictID
//   readonly method: string
//   readonly args?: any[]
// }

// export interface MsgIsInNotebook {
//   readonly type: MsgType.IsInNotebook
//   readonly info: SelectionInfo
// }

// export interface MsgSaveWord {
//   readonly type: MsgType.SaveWord
//   readonly area: DBArea
//   readonly info: SelectionInfo & { readonly date?: number }
// }

// export interface MsgDeleteWords {
//   readonly type: MsgType.DeleteWords
//   readonly area: DBArea
//   readonly dates?: number[]
// }

// export interface MsgGetWordsByText {
//   readonly type: MsgType.GetWordsByText
//   readonly area: DBArea
//   readonly text: string
// }

// export interface MsgGetWords {
//   readonly type: MsgType.GetWords
//   readonly area: DBArea
//   readonly itemsPerPage?: number
//   readonly pageNum?: number
//   readonly filters?: { [field: string]: string[] | undefined }
//   readonly sortField?: string
//   readonly sortOrder?: 'ascend' | 'descend' | false
//   readonly searchText?: string
// }

// export interface MsgGetSuggests {
//   readonly type: MsgType.GetSuggests
//   readonly text: string
// }

// export interface MsgGetWordsResponse {
//   readonly total: number
//   readonly words: Word[]
// }

// export type MsgTempDisabledState =
//   | {
//       readonly type: MsgType.TempDisabledState
//       readonly op: 'get'
//     }
//   | {
//       readonly type: MsgType.TempDisabledState
//       readonly op: 'set'
//       readonly value: boolean
//     }

// export interface MsgEditWord {
//   readonly type: MsgType.EditWord
//   readonly word: Word
// }

// export interface MsgIsPinned {
//   readonly type: MsgType.IsPinned
//   readonly isPinned: boolean
// }

// export interface MsgQSPanelIDChanged {
//   readonly type: MsgType.QSPanelIDChanged
//   readonly flag: boolean
// }

// export interface MsgQueryQSPanel {
//   readonly type: MsgType.QueryQSPanel
// }

// export type MsgQueryQSPanelResponse = boolean

// export interface MsgQueryPanelState {
//   readonly type: MsgType.QueryPanelState
//   /** object path, default returns the whole state */
//   readonly path?: string
// }

// export interface MsgSyncServiceInit<C = any> {
//   readonly type: MsgType.SyncServiceInit
//   readonly serviceID: string
//   readonly config: C
// }

// export interface MsgSyncServiceDownload {
//   readonly type: MsgType.SyncServiceDownload
//   readonly serviceID: string
//   readonly noCache?: boolean
// }

// export const enum SyncServiceUploadOp {
//   Add,
//   Delete
// }

// export interface MsgSyncServiceUpload {
//   readonly type: MsgType.SyncServiceUpload
//   readonly op: SyncServiceUploadOp
//   readonly serviceID?: string
//   /** When op is Add */
//   readonly words?: Word[]
//   /** When op is Delete */
//   readonly dates?: number[]
//   readonly force?: boolean
// }

// export interface MsgContextMenusClick {
//   readonly type: MsgType.ContextMenusClick
//   readonly menuItemId: string
//   readonly selectionText?: string
//   readonly linkUrl?: string
// }
