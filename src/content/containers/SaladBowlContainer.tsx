import React from 'react'
import ReactDOM from 'react-dom'
import { spring, presets, OpaqueConfig } from 'react-motion'
import SaladBowl from '../components/SaladBowl'

interface SaladBowlContainerProps {
  shouldShow: boolean
  mouseX: number
  mouseY: number
}

export default class SaladBowlContainer extends React.Component<SaladBowlContainerProps, any> {
  root = document.body
  el = document.createElement('div')
  isMount = false

  /** reusable tuple */
  _calcPositionShell: [number, number] = [0, 0]

  calcPosition (mouseX: number, mouseY: number): [number, number] {
    // icon position
    //             +-------+
    //             |       |
    //             |       | 30px
    //        60px +-------+
    //             |  30px
    //             |
    //       40px  |
    //     +-------+
    // cursor
    const tuple = this._calcPositionShell
    tuple[0] = mouseX + 40 + 30 > window.innerWidth ? mouseX - 40 - 30 : mouseX + 40
    tuple[1] = mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
    return tuple
  }

  componentWillUnmount () {
    if (this.el) {
      this.root.removeChild(this.el)
    }
  }

  render () {
    let [x, y]: (number | OpaqueConfig)[] = this.calcPosition(this.props.mouseX, this.props.mouseY)
    let scale: number | OpaqueConfig = 0

    if (this.props.shouldShow) {
      if (!this.isMount) {
        this.root.appendChild(this.el)
        this.isMount = true
        scale = spring(1, presets.wobbly)
      } else {
        // only animate position when the bowl is already visible
        x = spring(x, presets.gentle)
        y = spring(y, presets.gentle)
        scale = 1
      }
    } else {
      if (this.isMount) {
        this.root.removeChild(this.el)
        this.isMount = false
      }
    }

    return ReactDOM.createPortal(
      React.createElement(SaladBowl, { x, y, scale }),
      this.el,
    )
  }
}
