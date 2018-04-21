import { SelectionInfo } from '@/_helpers/selection'
import { DictID } from '@/app-config'

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
  readonly mouseX?: number
  readonly mouseY?: number
  readonly dbClick: boolean
  readonly ctrlKey?: boolean
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
  type: MsgType.OpenURL
  url: string
  placeholder: true
  /** text to replace the placeholder */
  text: string
  /** use browser.runtime.getURL? */
  self?: boolean
}

interface MsgOpenUrlWithoutPlaceholder {
  type: MsgType.OpenURL
  url: string
  placeholder?: false
  /** use browser.runtime.getURL? */
  self?: boolean
}

export type MsgOpenUrl = MsgOpenUrlWithoutPlaceholder | MsgOpenUrlWithPlaceholder

export interface MsgAudioPlay {
  type: MsgType.PlayAudio
  src: string
}

export interface MsgFetchDictResult {
  type: MsgType.FetchDictResult
  dict: DictID
  text: string
}
