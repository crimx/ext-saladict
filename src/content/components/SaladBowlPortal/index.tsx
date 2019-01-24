import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import SaladBowl, { SaladBowlProps } from '../SaladBowl'

interface SaladBowlPortalProps extends SaladBowlProps {
  readonly shouldShow: boolean
  readonly isAnimation: boolean
  readonly bowlRect: { x: number, y: number }
  readonly mouseOnBowl: (flag: boolean) => any
}

export default class SaladBowlPortal extends React.Component<SaladBowlPortalProps> {
  el = document.createElement('div')
  bowl: null | HTMLElement = null
  isMount = false

  constructor (props) {
    super(props)
    this.el.className = 'saladict-DIV'
  }

  handleBowlEnter = (node: HTMLElement) => {
    this.bowl = node
    const { x, y } = this.props.bowlRect
    node.style.setProperty('left', `${x}px`, 'important')
    node.style.setProperty('top', `${y}px`, 'important')
  }

  handleBowlEntered = (node: HTMLElement) => {
    this.bowl = node
    const { x, y } = this.props.bowlRect
    node.style.setProperty('left', `${x}px`, 'important')
    node.style.setProperty('top', `${y}px`, 'important')
  }

  componentDidUpdate () {
    if (this.bowl) {
      const { x, y } = this.props.bowlRect
      this.bowl.style.setProperty('left', `${x}px`, 'important')
      this.bowl.style.setProperty('top', `${y}px`, 'important')
    }
  }

  componentWillUnmount () {
    document.body.removeChild(this.el)
  }

  renderBowl = () => {
    const { mouseOnBowl, isAnimation, bowlHover } = this.props
    return (
      <SaladBowl
        mouseOnBowl={mouseOnBowl}
        isAnimation={isAnimation}
        bowlHover={bowlHover}
      />
    )
  }

  render () {
    const { shouldShow, isAnimation } = this.props
    if (shouldShow) {
      if (!this.isMount) {
        document.body.appendChild(this.el)
        this.isMount = true
      }
    } else {
      if (this.isMount) {
        document.body.removeChild(this.el)
        this.isMount = false
      }
    }

    return ReactDOM.createPortal(
      <CSSTransition
        classNames='saladict-SaladBowl'
        in={shouldShow}
        timeout={1000}
        enter={isAnimation}
        exit={false}
        onEnter={this.handleBowlEnter}
        onEntered={this.handleBowlEntered}
      >
        {this.renderBowl}
      </CSSTransition>,
      this.el,
    )
  }
}
