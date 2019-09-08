import { connect } from 'react-redux'
import { WaveformBox, WaveformBoxProps } from './WaveformBox'
import { StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'

type Dispatchers = 'onHeightChanged'

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<WaveformBoxProps, Dispatchers> => ({
  onHeightChanged: height => {
    dispatch({
      type: 'UPDATE_PANEL_HEIGHT',
      payload: { area: 'waveformbox', height }
    })
  }
})

export const WaveformBoxContainer = connect(
  null,
  mapDispatchToProps
)(WaveformBox)

export default WaveformBoxContainer
