import { connect } from 'react-redux'
import { MtaBox, MtaBoxProps } from './MtaBox'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'
import { newWord } from '@/_helpers/record-manager'

type Dispatchers = 'searchText' | 'onInput' | 'onDrawerToggle'

const mapStateToProps = (
  state: StoreState
): Omit<MtaBoxProps, Dispatchers> => ({
  expand: state.isExpandMtaBox,
  maxHeight: state.config.panelMaxHeightRatio * window.innerHeight,
  text: state.text
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
  }
})

export const MtaBoxContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MtaBox)

export default MtaBoxContainer
