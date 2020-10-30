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
import { WaveformBoxContainer } from '../WaveformBox/WaveformBox.container'

const menuBar = <MenuBarContainer />
const dictList = <DictListContainer />
const waveformBox = <WaveformBoxContainer />

type OwnProps = 'height' | 'width'

const mapStateToProps = (
  state: StoreState,
  ownProps: Pick<DictPanelStandaloneProps, OwnProps>
): DictPanelStandaloneProps => {
  return {
    withAnimation: state.config.animation,
    darkMode: state.config.darkMode,
    panelCSS: state.config.panelCSS,
    fontSize: state.config.fontSize,
    menuBar,
    mtaBox: state.isShowMtaBox ? <MtaBoxContainer /> : null,
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
