import { connect } from 'react-redux'
import SaladBowlPortal from '../components/SaladBowlPortal'
import { StoreState } from '../redux/modules'
import { mouseOnBowl } from '../redux/modules/widget'

export const mapStateToProps = ({ config, selection, widget }: StoreState) => {
  const { direct, ctrl, icon, double } = config.mode
  const shouldShow = (
    widget.isMouseOnBowl || (
      selection.selectionInfo.text &&
      icon &&
      !widget.isPanelShow &&
      !direct &&
      !(double && selection.dbClick) &&
      !(ctrl && selection.ctrlKey)
    )
  )

  return {
    shouldShow,
    mouseX: selection.mouseX,
    mouseY: selection.mouseY,
  }
}

export const mapDispatchToProps = {
  mouseOnBowl,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaladBowlPortal)
