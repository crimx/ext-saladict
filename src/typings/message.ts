import { SelectionInfo } from '@/_helpers/selection'

export enum MsgType {
  /** Nothing */
  Null,
  /** Default */
  Default,

  /** Any type of mouse down */
  Selection,
  /** Mouse down with valid selection */
  SaladictSelection,

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

export interface MsgSelection {
  type: MsgType.Selection
  selectionInfo: SelectionInfo
  mouseX?: number
  mouseY?: number
  ctrlKey?: boolean
}

export interface MsgSaladictSelection {
  type: MsgType.SaladictSelection
  selectionInfo: SelectionInfo
  mouseX: number
  mouseY: number
  ctrlKey: boolean
}
