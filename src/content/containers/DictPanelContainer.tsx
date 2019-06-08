import { connect } from 'react-redux'
import DictPanelPortal, { DictPanelPortalDispatchers } from '../components/DictPanelPortal'
import { StoreState } from '../redux/modules'
import { searchText } from '../redux/modules/dictionaries'
import {
  requestFavWord,
  panelPinSwitch,
  closePanel,
  updateItemHeight,
  panelOnDrag,
  searchBoxUpdate,
} from '../redux/modules/widget'

export const mapStateToProps = ({
  config,
  selection,
  widget,
  dictionaries,
}: StoreState) => {
  return {
    isAnimation: config.animation,
    panelCSS: config.panelCSS,
    dictsConfig: config.dicts,
    fontSize: config.fontSize,
    panelMaxHeightRatio: config.panelMaxHeightRatio,
    mtaAutoUnfold: config.mtaAutoUnfold,
    searchSuggests: config.searchSuggests,
    tripleCtrlPreload: config.tripleCtrlPreload,

    activeConfigID: config.id,
    profiles: widget.profiles,

    selection,

    isFav: widget.isFav,
    isPinned: widget.isPinned,
    isTripleCtrl: widget.isTripleCtrl,
    withWaveform: widget.withWaveform,
    shouldPanelShow: widget.shouldPanelShow,
    panelRect: widget.panelRect,

    searchBox: widget.searchBox,

    dictionaries,
  }
}

export const mapDispatchToProps: { [k in keyof DictPanelPortalDispatchers]: Function } = {
  searchText,
  searchBoxUpdate,

  requestFavWord,
  panelPinSwitch,
  updateItemHeight,
  panelOnDrag,

  shareImg: () => {/** @todo */},
  closePanel: closePanel,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DictPanelPortal)
