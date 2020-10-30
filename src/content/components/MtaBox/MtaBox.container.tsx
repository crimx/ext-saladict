import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToProps
} from 'react-retux'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { newWord } from '@/_helpers/record-manager'
import { isQuickSearchPage, isPopupPage } from '@/_helpers/saladict'
import { MtaBox, MtaBoxProps } from './MtaBox'

type Dispatchers = ExtractDispatchers<
  MtaBoxProps,
  'searchText' | 'onInput' | 'onDrawerToggle' | 'onHeightChanged'
>

const mapStateToProps: MapStateToProps<
  StoreState,
  MtaBoxProps,
  Dispatchers
> = state => ({
  expand: state.isExpandMtaBox,
  text: state.text,
  shouldFocus:
    !state.activeProfile.mtaAutoUnfold ||
    state.activeProfile.mtaAutoUnfold !== 'hide' ||
    ((state.isQSPanel || isQuickSearchPage()) && state.config.qsFocus) ||
    isPopupPage()
})

const mapDispatchToProps: MapDispatchToProps<
  StoreAction,
  MtaBoxProps,
  Dispatchers
> = dispatch => ({
  searchText: text => {
    dispatch({ type: 'SEARCH_START', payload: { word: newWord({ text }) } })
  },
  onInput: text => {
    dispatch({ type: 'UPDATE_TEXT', payload: text })
  },
  onDrawerToggle: () => {
    dispatch({ type: 'TOGGLE_MTA_BOX' })
  },
  onHeightChanged: height => {
    dispatch({
      type: 'UPDATE_PANEL_HEIGHT',
      payload: { area: 'mtabox', height }
    })
  }
})

export const MtaBoxContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MtaBox)

export default MtaBoxContainer
