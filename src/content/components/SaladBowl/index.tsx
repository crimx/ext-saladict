import React from 'react'

const imgLeaf = require('@/assets/leaf.svg')
const imgOrange = require('@/assets/orange.svg')
const imgTomato = require('@/assets/tomato.svg')
const imgBowl = require('@/assets/bowl.svg')

export interface SaladBowlProps {
  readonly mouseOnBowl: (flag: boolean) => any
  readonly isAnimation: boolean
}

export default class SaladBowl extends React.PureComponent<SaladBowlProps> {
  mouseOnBowlTimeout: any

  handleMouseEnter = () => {
    this.mouseOnBowlTimeout = setTimeout(() => {
      this.props.mouseOnBowl(true)
    }, 500)
  }

  handleMouseLeave = () => {
    clearTimeout(this.mouseOnBowlTimeout)
    this.props.mouseOnBowl(false)
  }

  render () {
    const { isAnimation } = this.props
    return (
      <div className={'saladict-SaladBowl' + (isAnimation ? ' isAnimate' : '')}
        key={'saladict-SaladBowl'}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <img className='saladict-SaladBowl_Leaf' src={imgLeaf} />
        <img className='saladict-SaladBowl_Orange' src={imgOrange} />
        <img className='saladict-SaladBowl_Tomato' src={imgTomato} />
        <img className='saladict-SaladBowl_Bowl' src={imgBowl} />
      </div>
    )
  }
}
