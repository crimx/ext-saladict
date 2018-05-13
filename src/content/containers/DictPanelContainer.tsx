import { connect } from 'react-redux'
import DictPanelPortal, { DictPanelPortalDispatchers } from '../components/DictPanelPortal'
import { StoreState } from '../redux/modules'
import { searchText } from '../redux/modules/dictionaries'
import {
  openWordEditor,
  panelPinSwitch,
  closePanel,
  updateItemHeight,
  panelOnDrag,
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
    selectedDicts: config.dicts.selected,
    fontSize: config.fontSize,

    selection,

    isFav: widget.isFav,
    isPinned: widget.isPinned,
    isPanelAppear: widget.isPanelAppear,
    shouldPanelShow: widget.shouldPanelShow,
    panelRect: widget.panelRect,

    dictionaries,
  }
}

export const mapDispatchToProps: { [k in keyof DictPanelPortalDispatchers]: Function } = {
  searchText,

  openWordEditor,
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
