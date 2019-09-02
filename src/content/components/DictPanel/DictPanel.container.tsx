import React from 'react'
import { connect } from 'react-redux'
import { DictPanelPortal, DictPanelPortalProps } from './DictPanel.portal'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'
import { MenuBarContainer } from '../MenuBar/MenuBar.container'
import { MtaBoxContainer } from '../MtaBox/MtaBox.container'
import { DictListContainer } from '../DictList/DictList.container'
import { WaveformBox } from '../WaveformBox/WaveformBox'

const menuBar = <MenuBarContainer />
const mtaBox = <MtaBoxContainer />
const dictList = <DictListContainer />
const waveformBox = <WaveformBox />

type Dispatchers = 'onDragEnd'

const mapStateToProps = (
  state: StoreState
): Omit<DictPanelPortalProps, Dispatchers> => {
  return {
    show: state.isShowDictPanel,
    x: state.dictPanelCoord.x,
    y: state.dictPanelCoord.y,
    width: state.config.panelWidth,
    maxHeight: state.panelMaxHeight,
    minHeight: state.panelMinHeight,
    withAnimation: state.config.animation,
    menuBar,
    mtaBox,
    dictList,
    waveformBox,
    dragStartCoord: state.dragStartCoord
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<DictPanelPortalProps, Dispatchers> => ({
  onDragEnd: () => {
    dispatch({ type: 'DRAG_START_COORD', payload: null })
  }
})

export const DictPanelPortalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DictPanelPortal)

export default DictPanelPortalContainer
