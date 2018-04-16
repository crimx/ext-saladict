import { combineReducers } from 'redux'
import config, { ConfigState } from './config'
import selection, { SelectionState } from './selection'
import dictionaries, { DictionariesState } from './dictionaries'
import widget, { WidgetState } from './widget'

export default combineReducers({
  config,
  selection,
  dictionaries,
  widget,
})

export type StoreState = {
  config: ConfigState
  selection: SelectionState
  dictionaries: DictionariesState
  widget: WidgetState
}
