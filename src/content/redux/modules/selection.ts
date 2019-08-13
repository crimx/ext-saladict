import { message } from '@/_helpers/browser-api'
import { Message } from '@/typings/message'
import { newWord } from '@/_helpers/record-manager'
import { createReducer } from '../utils/createReducer'
import { Init } from '../utils/types'

export interface Payload {
  'SELECTION/NEW_SELECTION': Message<'SELECTION'>['payload']
}

export type State = typeof initState

export const initState: Message<'SELECTION'>['payload'] = {
  word: newWord(),
  mouseX: 0,
  mouseY: 0,
  self: false,
  dbClick: false,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  instant: false,
  force: false
}

export const reducer = createReducer<Payload, State>(initState, {
  'SELECTION/NEW_SELECTION': (state, action) => action.payload
})

export default reducer

export const init: Init<Payload> = dispatch => {
  message.self.addListener('SELECTION', ({ payload }) => {
    dispatch({ type: 'SELECTION/NEW_SELECTION', payload })
  })
}
