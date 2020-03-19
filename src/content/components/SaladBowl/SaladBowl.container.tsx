import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToProps
} from 'react-retux'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { SaladBowlPortal, SaladBowlPortalProps } from './SaladBowl.portal'

type Dispatchers = ExtractDispatchers<SaladBowlPortalProps, 'onActive'>

const mapStateToProps: MapStateToProps<
  StoreState,
  SaladBowlPortalProps,
  Dispatchers
> = state => ({
  show: state.isShowBowl,
  panelCSS: state.config.panelCSS,
  x: state.bowlCoord.x,
  y: state.bowlCoord.y,
  withAnimation: state.config.animation,
  enableHover: state.config.bowlHover
})

const mapDispatchToProps: MapDispatchToProps<
  StoreAction,
  SaladBowlPortalProps,
  Dispatchers
> = dispatch => ({
  onActive: () => {
    dispatch({ type: 'BOWL_ACTIVATED' })
  }
})

export const SaladBowlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SaladBowlPortal)

export default SaladBowlContainer
