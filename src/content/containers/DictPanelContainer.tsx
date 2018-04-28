import { connect } from 'react-redux'
import DictPanelPortal, { DictPanelPortalDispatchers } from '../components/DictPanelPortal'
import { StoreState } from '../redux/modules'
import { searchText } from '../redux/modules/dictionaries'
import { addToNotebook, removeFromNotebook, panelPinSwitch, closePanel } from '../redux/modules/widget'

export const mapStateToProps = ({
  config,
  selection,
  widget,
  dictionaries,
}: StoreState) => {
  return {
    config,
    selection,
    isFav: widget.isFav,
    isPinned: widget.isPinned,
    isPanelAppear: widget.isPanelAppear,
    shouldPanelShow: widget.shouldPanelShow,
    dictionaries: dictionaries,
  }
}

export const mapDispatchToProps: { [k in keyof DictPanelPortalDispatchers]: Function } = {
  searchText,

  addToNotebook,
  removeFromNotebook,
  panelPinSwitch,

  shareImg: () => {/** @todo */},
  closePanel: closePanel,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DictPanelPortal)
