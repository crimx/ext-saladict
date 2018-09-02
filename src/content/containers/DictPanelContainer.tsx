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
    allDictsConfig: config.dicts.all,
    fontSize: config.fontSize,
    langCode: config.langCode,
    panelMaxHeightRatio: config.panelMaxHeightRatio,
    mtaAutoUnfold: config.mtaAutoUnfold,

    activeConfigID: config.id,
    configProfiles: widget.configProfiles,

    selection,

    isFav: widget.isFav,
    isPinned: widget.isPinned,
    shouldPanelShow: widget.shouldPanelShow,
    panelRect: widget.panelRect,

    searchBoxText: widget.searchBoxText,
    searchBoxIndex: widget.searchBoxIndex,

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
