import './_style.scss'
import React from 'react'
import { Spring, SpringConfig } from 'react-spring'

const imgLeaf = require('@/assets/leaf.svg')
const imgOrange = require('@/assets/orange.svg')
const imgTomato = require('@/assets/tomato.svg')
const imgBowl = require('@/assets/bowl.svg')

export type SaladBowlProps = {
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly springImmediateCtrl: (key: string) => boolean
  readonly springConfigCtrl: (key: string) => SpringConfig
  readonly mouseOnBowl: (flag: boolean) => any
  readonly searchText: () => any
}

export default class SaladBowl extends React.PureComponent<SaladBowlProps> {
  readonly bowlRef = React.createRef<HTMLDivElement>()
  initStyle = { x: 0, y: 0, scale: 0 }
  mouseOnBowlTimeout: any

  handleMouseEnter = () => {
    this.mouseOnBowlTimeout = setTimeout(() => {
      this.props.mouseOnBowl(true)
      this.props.searchText()
    }, 800)
  }

  handleMouseLeave = () => {
    clearTimeout(this.mouseOnBowlTimeout)
    this.props.mouseOnBowl(false)
  }

  animateBowl = style => {
    const el = this.bowlRef.current
    if (el) {
      const { x, y, scale } = style
      el.style.setProperty(
        'transform',
        `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        'important',
      )
    }
    return null
  }

  render () {
    const { x, y, scale, springConfigCtrl, springImmediateCtrl } = this.props
    return (
      <div className='saladict-SaladBowl'
        key={'saladict-SaladBowl'}
        ref={this.bowlRef}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Spring
          from={this.initStyle}
          to={{ x, y, scale }}
          immediate={springImmediateCtrl}
          config={springConfigCtrl}
        >{this.animateBowl}</Spring>
        <img className='saladict-SaladBowl_Leaf' src={imgLeaf} />
        <img className='saladict-SaladBowl_Orange' src={imgOrange} />
        <img className='saladict-SaladBowl_Tomato' src={imgTomato} />
        <img className='saladict-SaladBowl_Bowl' src={imgBowl} />
      </div>
    )
  }
}
