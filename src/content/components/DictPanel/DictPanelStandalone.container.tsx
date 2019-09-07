import React from 'react'
import { connect } from 'react-redux'
import {
  DictPanelStandalone,
  DictPanelStandaloneProps
} from './DictPanelStandalone'
import { StoreState } from '@/content/redux/modules'
import { MenuBarContainer } from '../MenuBar/MenuBar.container'
import { MtaBoxContainer } from '../MtaBox/MtaBox.container'
import { DictListContainer } from '../DictList/DictList.container'
import { WaveformBox } from '../WaveformBox/WaveformBox'

const menuBar = <MenuBarContainer />
const mtaBox = <MtaBoxContainer />
const dictList = <DictListContainer />
const waveformBox = <WaveformBox />

type OwnProps = 'height' | 'width'

const mapStateToProps = (
  state: StoreState,
  ownProps: Pick<DictPanelStandaloneProps, OwnProps>
): DictPanelStandaloneProps => {
  return {
    withAnimation: state.config.animation,
    menuBar,
    mtaBox,
    dictList,
    waveformBox,
    width: ownProps.width,
    height: ownProps.height
  }
}

export const DictPanelStandaloneContainer = connect(mapStateToProps)(
  DictPanelStandalone
)

export default DictPanelStandaloneContainer
