import React from 'react'
import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToProps
} from 'react-retux'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { DictPanelPortal, DictPanelPortalProps } from './DictPanel.portal'
import { MenuBarContainer } from '../MenuBar/MenuBar.container'
import { MtaBoxContainer } from '../MtaBox/MtaBox.container'
import { DictListContainer } from '../DictList/DictList.container'
import { WaveformBoxContainer } from '../WaveformBox/WaveformBox.container'

const menuBar = <MenuBarContainer />
const dictList = <DictListContainer />
const waveformBox = <WaveformBoxContainer />

type Dispatchers = ExtractDispatchers<DictPanelPortalProps, 'onDragEnd'>

const mapStateToProps: MapStateToProps<
  StoreState,
  DictPanelPortalProps,
  Dispatchers
> = state => ({
  show: state.isShowDictPanel,
  coord: state.dictPanelCoord,
  takeCoordSnapshot: state.wordEditor.isShow,
  width: state.config.panelWidth,
  height: state.panelHeight,
  maxHeight: state.panelMaxHeight,
  fontSize: state.config.fontSize,
  withAnimation: state.config.animation,
  panelCSS: state.config.panelCSS,
  darkMode: state.config.darkMode,
  menuBar,
  mtaBox: state.isShowMtaBox ? <MtaBoxContainer /> : null,
  dictList,
  waveformBox: state.activeProfile.waveform ? waveformBox : null,
  dragStartCoord: state.dragStartCoord
})

const mapDispatchToProps: MapDispatchToProps<
  StoreAction,
  DictPanelPortalProps,
  Dispatchers
> = dispatch => ({
  onDragEnd: () => {
    dispatch({ type: 'DRAG_START_COORD', payload: null })
  }
})

export const DictPanelPortalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DictPanelPortal)

export default DictPanelPortalContainer
