import { connect } from 'react-redux'
import { WaveformBox, WaveformBoxProps } from './WaveformBox'
import { StoreAction, StoreState } from '@/content/redux/modules'
import { Dispatch } from 'redux'

type Dispatchers = 'onHeightChanged' | 'toggleExpand'

const mapStateToProps = (
  state: StoreState
): Omit<WaveformBoxProps, Dispatchers> => {
  return {
    darkMode: state.config.darkMode,
    isExpand: state.isExpandWaveformBox
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<WaveformBoxProps, Dispatchers> => ({
  onHeightChanged: height => {
    dispatch({
      type: 'UPDATE_PANEL_HEIGHT',
      payload: { area: 'waveformbox', height }
    })
  },
  toggleExpand: () => {
    dispatch({ type: 'TOGGLE_WAVEFORM_BOX' })
  }
})

export const WaveformBoxContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WaveformBox)

export default WaveformBoxContainer
