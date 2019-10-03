import { connect } from 'react-redux'
import { MtaBox, MtaBoxProps } from './MtaBox'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'
import { newWord } from '@/_helpers/record-manager'
import { isStandalonePage } from '@/_helpers/saladict'

type Dispatchers =
  | 'searchText'
  | 'onInput'
  | 'onDrawerToggle'
  | 'onHeightChanged'

const mapStateToProps = (
  state: StoreState
): Omit<MtaBoxProps, Dispatchers> => ({
  expand: state.isExpandMtaBox,
  maxHeight: state.panelMaxHeight,
  text: state.text,
  shouldFocus:
    !state.activeProfile.mtaAutoUnfold || state.isQSPanel || isStandalonePage()
})

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<MtaBoxProps, Dispatchers> => ({
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
