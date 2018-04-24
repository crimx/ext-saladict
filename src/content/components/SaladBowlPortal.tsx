import React from 'react'
import ReactDOM from 'react-dom'
import { spring, presets, OpaqueConfig } from 'react-motion'
import SaladBowl from './SaladBowl'

interface SaladBowlPortalProps {
  readonly shouldShow: boolean
  readonly mouseX: number
  readonly mouseY: number
  readonly mouseOnBowl: (flag: boolean) => any
  readonly searchText: () => any
}

export default class SaladBowlPortal extends React.Component<SaladBowlPortalProps, any> {
  root = document.body
  el = document.createElement('div')
  isMount = false

  componentWillUnmount () {
    this.root.removeChild(this.el)
  }

  render () {
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
    const { mouseX, mouseY, mouseOnBowl, searchText } = this.props
    let x: number | OpaqueConfig = mouseX + 70 > window.innerWidth ? mouseX - 70 : mouseX + 40
    let y: number | OpaqueConfig = mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
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
      React.createElement(SaladBowl, { x, y, scale, mouseOnBowl, searchText }),
      this.el,
    )
  }
}
