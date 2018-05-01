import { SelectionInfo } from '@/_helpers/selection'
import { DictID } from '@/app-config'
import { Word, Area as DBArea } from '@/background/database'

export const enum MsgType {
  /** Nothing */
  Null,
  /** Default */
  Default,

  /** Mouse down, selection maybe empty */
  Selection,

  /** Ctrl/Command has been hit 3 times */
  TripleCtrl,

  /** Response the pageInfo of a page */
  PageInfo,

  /** Create a tab with the url */
  OpenURL,
  /** Play a audio src */
  PlayAudio,
  /** Search text with a dictionary and response the result */
  FetchDictResult,
  /** Request background proxy for current selection */
  PreloadSelection,
  /** Get clipboard content */
  GetClipboard,

  IsInNotebook,
  SaveWord,
  DeleteWord,
  GetWordsByText,
  GetAllWords,

  /**
   * Background proxy sends back underlyingly
   */
  __PageInfo__,
  __PreloadSelection__,
}

/** iframe messaging */
export const enum PostMsgType {
  Selection = 'SALADICT_SELECTION',
}

export interface MsgSelection {
  readonly type: MsgType.Selection
  readonly selectionInfo: SelectionInfo
  readonly mouseX: number
  readonly mouseY: number
  readonly dbClick: boolean
  readonly ctrlKey: boolean
  /** force panel to skip reconciling position */
  readonly force?: boolean
}

export interface PostMsgSelection {
  readonly type: PostMsgType.Selection
  readonly selectionInfo: SelectionInfo
  readonly mouseX: number
  readonly mouseY: number
  readonly dbClick: boolean
  readonly ctrlKey: boolean
}

interface MsgOpenUrlWithPlaceholder {
  readonly type: MsgType.OpenURL
  readonly url: string
  readonly placeholder: true
  /** text to replace the placeholder */
  readonly text: string
  /** use browser.runtime.getURL? */
  readonly self?: boolean
}

interface MsgOpenUrlWithoutPlaceholder {
  readonly type: MsgType.OpenURL
  readonly url: string
  readonly placeholder?: false
  /** use browser.runtime.getURL? */
  readonly self?: boolean
}

export type MsgOpenUrl = MsgOpenUrlWithoutPlaceholder | MsgOpenUrlWithPlaceholder

export interface MsgAudioPlay {
  readonly type: MsgType.PlayAudio
  readonly src: string
}

export interface MsgFetchDictResult {
  readonly type: MsgType.FetchDictResult
  readonly id: DictID
  readonly text: string
}

export interface MsgIsInNotebook {
  readonly type: MsgType.IsInNotebook
  readonly info: SelectionInfo
}

export interface MsgSaveWord {
  readonly type: MsgType.SaveWord
  readonly area: DBArea
  readonly info: SelectionInfo
}

export interface MsgDeleteWord {
  readonly type: MsgType.DeleteWord
  readonly area: DBArea
  readonly word: Word
}

export interface MsgGetWordsByText {
  readonly type: MsgType.GetWordsByText
  readonly area: DBArea
  readonly text: string
}

export interface MsgGetAllWords {
  readonly type: MsgType.GetAllWords
  readonly area: DBArea
  readonly itemsPerPage: number
  readonly pageNum: number
}
