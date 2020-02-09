import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToProps
} from 'react-retux'
import { StoreAction, StoreState } from '@/content/redux/modules'
import { WaveformBox, WaveformBoxProps } from './WaveformBox'

type Dispatchers = ExtractDispatchers<
  WaveformBoxProps,
  'onHeightChanged' | 'toggleExpand'
>

const mapStateToProps: MapStateToProps<
  StoreState,
  WaveformBoxProps,
  Dispatchers
> = state => {
  return {
    darkMode: state.config.darkMode,
    isExpand: state.isExpandWaveformBox
  }
}

const mapDispatchToProps: MapDispatchToProps<
  StoreAction,
  WaveformBoxProps,
  Dispatchers
> = dispatch => ({
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
