import React from 'react'
import { connect } from 'react-redux'
import { DictPanelPortal, DictPanelPortalProps } from './DictPanel.portal'
import { StoreState } from '@/content/redux/modules'
import { MenuBarContainer } from '../MenuBar/MenuBar.container'
import { MtaBoxContainer } from '../MtaBox/MtaBox.container'
import { DictListContainer } from '../DictList/DictList.container'
import { WaveformBox } from '../WaveformBox/WaveformBox'

const menuBar = <MenuBarContainer />
const mtaBox = <MtaBoxContainer />
const dictList = <DictListContainer />
const waveformBox = <WaveformBox />

type Dispatchers = 'searchText' | 'onInput' | 'onDrawerToggle'

const mapStateToProps = (
  state: StoreState
): Omit<DictPanelPortalProps, Dispatchers> => {
  const { mouseX, mouseY } = state.dictPanelCord
  return {
    show: state.isShowDictPanel,
    // icon position       10px  panel position
    //           +-------+      +------------------------+
    //           |       |      |                        |
    //           |       | 30px |                        |
    //      50px +-------+      |                        |
    //           |  30px        |                        |
    //     20px  |              |                        |
    //     +-----+              |                        |
    // cursor
    // negative number for skipping offset
    x: mouseX < 0 ? -mouseX : mouseX + 20 + 30 + 10,
    y: mouseY < 0 ? -mouseY : mouseY - 20 - 30,
    width: state.config.panelWidth,
    maxHeight: state.panelMaxHeight,
    minHeight: state.panelMinHeight,
    withAnimation: state.config.animation,
    menuBar,
    mtaBox,
    dictList,
    waveformBox
  }
}

export const DictPanelPortalContainer = connect(mapStateToProps)(
  DictPanelPortal
)

export default DictPanelPortalContainer
