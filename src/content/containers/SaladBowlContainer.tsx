import { connect } from 'react-redux'
import SaladBowlPortal from '../components/SaladBowlPortal'
import { StoreState } from '../redux/modules'
import { mouseOnBowl } from '../redux/modules/widget'
import { searchText } from '../redux/modules/dictionaries'

export const mapStateToProps = ({ config, selection, widget }: StoreState) => {
  const { direct, ctrl, icon, double } = config.mode
  const shouldShow = (
    selection.selectionInfo.text &&
    icon &&
    !widget.isPinned &&
    !direct &&
    !(double && selection.dbClick) &&
    !(ctrl && selection.ctrlKey)
  )

  return {
    shouldShow,
    mouseX: selection.mouseX,
    mouseY: selection.mouseY,
  }
}

export const mapDispatchToProps = {
  mouseOnBowl,
  searchText,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaladBowlPortal)
