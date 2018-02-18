import { SelectionInfo } from '@/_helpers/selection'

/* tslint:disable:class-name */

export interface MsgSELECTION {
  type: 'SELECTION'
  selectionInfo: SelectionInfo
  mouseX?: number
  mouseY?: number
  ctrlKey?: boolean
}

export interface MsgSALADICT_SELECTION {
  type: 'SALADICT_SELECTION'
  selectionInfo: SelectionInfo
  mouseX: number
  mouseY: number
  ctrlKey: boolean
}
