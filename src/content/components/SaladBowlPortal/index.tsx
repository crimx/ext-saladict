import React from 'react'
import ReactDOM from 'react-dom'
import { config as springConfig, SpringConfig } from 'react-spring'
import SaladBowl from '../SaladBowl'

interface SaladBowlPortalProps {
  readonly shouldShow: boolean
  readonly mouseX: number
  readonly mouseY: number
  readonly mouseOnBowl: (flag: boolean) => any
}

export default class SaladBowlPortal extends React.Component<SaladBowlPortalProps, any> {
  root = document.body
  el = document.createElement('div')
  isMount = false
  isAppeare = false

  springImmediateCtrl = (key: string): boolean => {
    switch (key) {
      case 'x':
      case 'y':
        return !this.isMount || this.isAppeare
      case 'scale':
        return !this.isAppeare
      default:
        return false
    }
  }

  springConfigCtrl = (key: string): SpringConfig => {
    switch (key) {
      case 'x':
      case 'y':
        return springConfig.gentle
      case 'scale':
        return springConfig.wobbly
      default:
        return springConfig.default
    }
  }

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
    const { springConfigCtrl, springImmediateCtrl } = this
    const { mouseX, mouseY, mouseOnBowl, shouldShow } = this.props
    const x: number = mouseX + 70 > window.innerWidth ? mouseX - 70 : mouseX + 40
    const y: number = mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
    const scale: number = shouldShow ? 1 : 0

    this.isAppeare = false
    if (shouldShow) {
      if (!this.isMount) {
        this.root.appendChild(this.el)
        this.isMount = true
        this.isAppeare = true
      }
    } else {
      if (this.isMount) {
        this.root.removeChild(this.el)
        this.isMount = false
      }
    }

    return ReactDOM.createPortal(
      React.createElement(SaladBowl, {
        x, y, scale,
        springImmediateCtrl,
        springConfigCtrl,
        mouseOnBowl,
      }),
      this.el,
    )
  }
}
