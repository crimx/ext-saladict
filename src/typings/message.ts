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

  OPEN_URL: {
    payload: {
      url: string
      /** use browser.runtime.getURL? */
      self?: boolean
    }
    response: void
  }

  OPEN_DICT_SRC_PAGE: {
    /** Open the source page of a dictionary */
    payload: {
      id: DictID
      text: string
    }
    response: void
  }

  PAGE_INFO: {
    /** Request backend for page info */
    payload?: undefined
    response: {
      pageId: string | number
      faviconURL?: string
      pageTitle?: string
      pageURL?: string
    }
  }

  GET_SUGGESTS: {
    /** Request backend to fetch suggest */
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
      /** search function payload */
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

  DICT_ENGINE_METHOD: {
    /** call any method exported from the engine */
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

  IS_IN_NOTEBOOK: {
    /** Is a word in Notebook */
    payload: Word
    response: boolean
  }

  SAVE_WORD: {
    /** Save a word to Notebook or History */
    payload: {
      area: DBArea
      word: Word
    }
    response: void
  }

  DELETE_WORDS: {
    payload: {
      area: DBArea
      dates?: number[]
    }
    response: void
  }

  GET_WORDS_BY_TEXT: {
    payload: {
      area: DBArea
      text: string
    }
    response: void
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
    response: void
  }

  /* ------------------------------------------------ *\
     Audio Playing
  \* ------------------------------------------------ */

  PLAY_AUDIO: {
    /** url: to backend */
    payload: string
    response: void
  }

  WAVEFORM_PLAY_AUDIO: {
    /** url: to waveform */
    payload: string
    response: void
  }

  LAST_PLAY_AUDIO: {
    /** waveform to panel */
    payload?: undefined
    /** url */
    response?: string
  }

  /* ------------------------------------------------ *\
     Text Selection
  \* ------------------------------------------------ */

  SELECTION: {
    /** To dict panel */
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
    response: void
  }

  /* ------------------------------------------------ *\
     Dict Panel
  \* ------------------------------------------------ */

  PIN_STATE: {
    /** From dict panel when it is pinned or unpinned */
    payload: boolean
    response: void
  }

  QUERY_PANEL_STATE: {
    /** Other pages or frames query for panel state */
    /** object path, default returns the whole state */
    payload?: string
    response: void
  }

  /* ------------------------------------------------ *\
     Sync services
  \* ------------------------------------------------ */

  SYNC_SERVICE_INIT: {
    payload: {
      serviceID: string
      config: any
    }
    response: void
  }

  SYNC_SERVICE_DOWNLOAD: {
    payload?: {
      serviceID?: string
      noCache?: boolean
    }
    response: void
  }

  SYNC_SERVICE_ADD: {
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      words: Word[]
    }
    response: void
  }

  SYNC_SERVICE_DELETE: {
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      dates?: number[]
      force?: boolean
    }
    response: void
  }
}

export type MsgType = keyof MessageConfig

// 'extends' hack to generate union
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
export type Message<
  T extends MsgType = MsgType
> = MessageConfig[T]['payload'] extends undefined
  ? Readonly<{
      type: T
      payload?: MessageConfig[T]['payload']
    }>
  : Readonly<{
      type: T
      payload: MessageConfig[T]['payload']
    }>

export type MessageResponse<T extends MsgType> = Readonly<
  MessageConfig[T]['response']
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

//   OpenQSPanel,
//   CloseQSPanel,

//   QSPanelSearchText,

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

// export interface MsgQSPanelSearchText {
//   readonly type: MsgType.QSPanelSearchText
//   readonly info: SelectionInfo
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
