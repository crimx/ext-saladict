import { connect } from 'react-redux'
import { SaladBowlPortal, SaladBowlPortalProps } from './SaladBowl.portal'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'

type Dispatchers = 'onChange'

const mapStateToProps = (
  state: StoreState
): Omit<SaladBowlPortalProps, Dispatchers> => ({
  show: state.widget.isShowDictPanel,
  mouseX: state.selection.mouseX,
  mouseY: state.selection.mouseY,
  withAnimation: state.config.config.animation,
  enableHover: state.config.config.bowlHover
})

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<SaladBowlPortalProps, Dispatchers> => ({
  onChange: (active: boolean) => {
    if (active) {
      dispatch({ type: 'WIDGET/BOWL_ACTIVATED' })
    }
  }
})

export const SaladBowlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SaladBowlPortal)

export default SaladBowlContainer
