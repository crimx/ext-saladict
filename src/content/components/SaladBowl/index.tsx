import React from 'react'
import { Motion, OpaqueConfig } from 'react-motion'

export type SaladBowlProps = {
  readonly x: number | OpaqueConfig
  readonly y: number | OpaqueConfig
  readonly scale: number | OpaqueConfig
}

export default class SaladBowl extends React.Component<SaladBowlProps> {
  bowlRef = React.createRef<HTMLDivElement>()

  motionBowl = style => {
    const el = this.bowlRef.current
    if (el) {
      const { x, y, scale } = style
      el.style.setProperty(
        'transform',
        `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        'important',
      )
    }

    return (
      <div className='saladict-SaladBowl' ref={this.bowlRef}>
        <img className='saladict-SaladBowl_Leaf' src={require('@/assets/leaf.svg')} />
        <img className='saladict-SaladBowl_Orange' src={require('@/assets/orange.svg')} />
        <img className='saladict-SaladBowl_Tomato' src={require('@/assets/tomato.svg')} />
        <img className='saladict-SaladBowl_Bowl' src={require('@/assets/bowl.svg')} />
      </div>
    )
  }

  render () {
    return <Motion style={this.props}>{this.motionBowl}</Motion>
  }
}
