import { connect } from 'react-redux'
import SaladBowlPortal from '../components/SaladBowlPortal'
import { StoreState } from '../redux/modules'
import { mouseOnBowl } from '../redux/modules/widget'

export const mapStateToProps = ({ config, selection, widget }: StoreState) => {
  return {
    shouldShow: widget.shouldBowlShow,
    isAnimation: config.animation,
    bowlRect: widget.bowlRect,
  }
}

export const mapDispatchToProps = {
  mouseOnBowl,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaladBowlPortal)
