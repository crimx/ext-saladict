import { connect } from 'react-redux'
import DictPanelPortal, { DictPanelPortalDispatchers } from '../components/DictPanelPortal'
import { StoreState } from '../redux/modules'
import { searchText } from '../redux/modules/dictionaries'
import { sendEmptySelection } from '../redux/modules/selection'
import { addToNotebook, removeFromNotebook, pinPanel, showPanel } from '../redux/modules/widget'

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
    isMouseOnBowl: widget.isMouseOnBowl,
    dictionaries: dictionaries,
  }
}

export const mapDispatchToProps: { [k in keyof DictPanelPortalDispatchers]: Function } = {
  showPanel,
  searchText,

  addToNotebook,
  removeFromNotebook,
  pinPanel,

  shareImg: () => {/** @todo */},
  closePanel: sendEmptySelection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DictPanelPortal)
