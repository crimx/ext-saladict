import { Word, DBArea } from '@/_helpers/record-manager'
// import { DictID } from '@/app-config'
// import { Word, Area as DBArea } from '@/_helpers/record-manager'
import { UnionPick } from '@/typings/helpers'
import { DictID } from '@/app-config'
// import { DictSearchResult } from '@/typings/server'

export type MessageConfig = {
  OPEN_URL: {
    type: 'OPEN_URL'
    payload: {
      url: string
      /** use browser.runtime.getURL? */
      self?: boolean
    }
  }
  OPEN_DICT_SRC_PAGE: {
    /** Open the source page of a dictionary */
    type: 'OPEN_DICT_SRC_PAGE'
    payload: {
      id: DictID
      text: string
    }
  }

  PAGE_INFO: {
    /** Request backend for page info */
    type: 'PAGE_INFO'
    response: {
      pageId: string | number
      faviconURL?: string
      pageTitle?: string
      pageURL?: string
    }
  }

  GET_SUGGESTS: {
    /** Request backend to fetch suggest */
    type: 'GET_SUGGESTS'
    /** Search text */
    payload: string
    /** Response with suggest items */
    response: Array<{
      explain: string
      entry: string
    }>
  }

  PLAY_AUDIO: {
    type: 'PLAY_AUDIO'
    /** url */
    payload: string
  }

  DICT_ENGINE_METHOD: {
    /** call any method exported from the engine */
    type: 'DICT_ENGINE_METHOD'
    payload: {
      id: DictID
      method: string
      args?: any[]
    }
    response: any
  }

  IS_IN_NOTEBOOK: {
    /** Is a word in Notebook */
    type: 'IS_IN_NOTEBOOK'
    payload: Word
    response: boolean
  }
  SAVE_WORD: {
    /** Save a word to Notebook or History */
    type: 'SAVE_WORD'
    payload: {
      area: DBArea
      word: Word
    }
  }
  DELETE_WORDS: {
    type: 'DELETE_WORDS'
    payload: {
      area: DBArea
      dates?: number[]
    }
  }
  GET_WORDS_BY_TEXT: {
    type: 'GET_WORDS_BY_TEXT'
    payload: {
      area: DBArea
      text: string
    }
  }
  GET_WORDS: {
    type: 'GET_WORDS'
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

  SYNC_SERVICE_INIT: {
    type: 'SYNC_SERVICE_INIT'
    payload: {
      serviceID: string
      config: any
    }
  }
  SYNC_SERVICE_DOWNLOAD: {
    type: 'SYNC_SERVICE_DOWNLOAD'
    payload?: {
      serviceID?: string
      noCache?: boolean
    }
  }
  SYNC_SERVICE_ADD: {
    type: 'SYNC_SERVICE_ADD'
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      words: Word[]
    }
  }
  SYNC_SERVICE_DELETE: {
    type: 'SYNC_SERVICE_DELETE'
    payload: {
      /** If not provided, call all services */
      serviceID?: string
      dates?: number[]
      force?: boolean
    }
  }
}

export type MsgType = keyof MessageConfig

export type Message<T = undefined> = T extends MsgType
  ? Readonly<
      Pick<
        MessageConfig[T],
        Extract<'type' | 'payload', keyof MessageConfig[T]>
      >
    >
  : Readonly<UnionPick<MessageConfig[MsgType], 'type' | 'payload'>>

export type MessageResponse<T extends MsgType> = Readonly<
  MessageConfig[T][Extract<'response', keyof MessageConfig[T]>]
>

// export enum MsgType {
//   /** Nothing */
//   Null,
//   /** Default */
//   Default,

//   /** is dict panel pinned? */
//   IsPinned,

//   /** is a standalone panel running? */
//   QSPanelIDChanged,

//   /** query background for standalone panel appearance */
//   QueryQSPanel,

//   OpenQSPanel,
//   CloseQSPanel,

//   QSPanelSearchText,

//   /** Mouse down, selection maybe empty */
//   Selection,

//   /** Ctrl/Command has been hit 3 times */
//   TripleCtrl,

//   /** Escape key is pressed */
//   EscapeKey,

//   /** Response the pageInfo of a page */
//   PageInfo,

//   /** Create a tab with the url or highlight an existing one */
//   OpenURL,
//   /** open a dictionary source page */
//   OpenSrcPage,
//   /** Request background to play a audio src */
//   PlayAudio,
//   /** Background to a dict panel on one page */
//   PlayWaveform,
//   /** Search text with a dictionary and response the result */
//   FetchDictResult,
//   /** Call a custom method of a dict engine */
//   DictEngineMethod,
//   /** Request background proxy for current selection */
//   PreloadSelection,
//   /** Get clipboard content */
//   GetClipboard,

//   RequestCSS,

//   IsInNotebook,
//   SaveWord,
//   WordSaved,
//   DeleteWords,
//   GetWordsByText,
//   GetWords,
//   GetSuggests,

//   /** Popup page */
//   TempDisabledState,

//   /** Word page */
//   EditWord,

//   /** Query panel state */
//   QueryPanelState,

//   /** Manually emit selection event */
//   EmitSelection,

//   SyncServiceInit,
//   SyncServiceDownload,
//   SyncServiceUpload,

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
