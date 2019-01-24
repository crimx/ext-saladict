import React from 'react'

export interface SaladBowlProps {
  readonly mouseOnBowl: (flag: boolean) => any
  readonly isAnimation: boolean
  readonly bowlHover: boolean
}

export default class SaladBowl extends React.PureComponent<SaladBowlProps> {
  mouseOnBowlTimeout: any

  handleMouseEnter = () => {
    if (this.props.bowlHover) {
      this.mouseOnBowlTimeout = setTimeout(() => {
        this.props.mouseOnBowl(true)
      }, 500)
    }
  }

  handleMouseLeave = () => {
    clearTimeout(this.mouseOnBowlTimeout)
    this.props.mouseOnBowl(false)
  }

  handleClick = () => {
    this.props.mouseOnBowl(true)
  }

  render () {
    const { isAnimation, bowlHover } = this.props
    return (
      <div className={(
        'saladict-SaladBowl' +
        (isAnimation ? ' isAnimate' : '') +
        (bowlHover ? ' bowlHover' : '')
      )}
        role='img'
        key='saladict-SaladBowl'
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
      >
        <div className='saladict-SaladBowl_Leaf' />
        <div className='saladict-SaladBowl_Orange' />
        <div className='saladict-SaladBowl_Tomato' />
        <div className='saladict-SaladBowl_Bowl' />
      </div>
    )
  }
}
