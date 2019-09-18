import { connect } from 'react-redux'
import { SaladBowlPortal, SaladBowlPortalProps } from './SaladBowl.portal'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'

type Dispatchers = 'onActive'

const mapStateToProps = (
  state: StoreState
): Omit<SaladBowlPortalProps, Dispatchers> => ({
  show: state.isShowBowl,
  x: state.bowlCoord.x,
  y: state.bowlCoord.y,
  withAnimation: state.config.animation,
  enableHover: state.config.bowlHover
})

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<SaladBowlPortalProps, Dispatchers> => ({
  onActive: () => {
    dispatch({ type: 'BOWL_ACTIVATED' })
  }
})

export const SaladBowlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SaladBowlPortal)

export default SaladBowlContainer
