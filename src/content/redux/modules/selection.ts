import { message } from '@/_helpers/browser-api'
import { MsgSelection, MsgType } from '@/typings/message'

/*-----------------------------------------------*\
    Actions
\*-----------------------------------------------*/

const enum Actions {
  NEW_SELECTION = 'selection/NEW_SELECTION'
}

/*-----------------------------------------------*\
    State
\*-----------------------------------------------*/

export type SelectionState = MsgSelection

const initState: SelectionState = {
  type: MsgType.Selection,
  selectionInfo: {
    text: '',
    context: '',
    title: '',
    url: '',
    favicon: '',
    trans: '',
    note: '',
  },
  mouseX: 0,
  mouseY: 0,
  dbClick: false,
  ctrlKey: false,
}

export default function reducer (state = initState, action) {
  switch (action.type) {
    case Actions.NEW_SELECTION:
      return action.payload
    default:
      return state
  }
}

/*-----------------------------------------------*\
    Action Creators
\*-----------------------------------------------*/

/** When new selection is made */
export const newSelection = selection => ({ type: Actions.NEW_SELECTION, payload: selection })

/*-----------------------------------------------*\
    Side Effects
\*-----------------------------------------------*/

export function listenSelection () {
  return dispatch => {
    message.self.addListener(MsgType.Selection, message => dispatch(newSelection(message)))
  }
}
