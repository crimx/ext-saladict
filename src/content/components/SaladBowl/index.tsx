import React from 'react'
import { Motion, OpaqueConfig } from 'react-motion'

export type SaladBowlProps = {
  x: number | OpaqueConfig
  y: number | OpaqueConfig
  scale: number | OpaqueConfig
}

const Bowl = params => {
  const style = {
    transform: `translate3d(${params.x}px, ${params.y}px, 0) scale(${params.scale})`
  }

  return (
    <div className='saladict-SaladBowl' style={style}>
      <img className='saladict-SaladBowl_Leaf' src={require('@/assets/leaf.svg')} />
      <img className='saladict-SaladBowl_Orange' src={require('@/assets/orange.svg')} />
      <img className='saladict-SaladBowl_Tomato' src={require('@/assets/tomato.svg')} />
      <img className='saladict-SaladBowl_Bowl' src={require('@/assets/bowl.svg')} />
    </div>
  )
}

export default function SaladBowl (props) {
  return <Motion style={props}>{Bowl}</Motion>
}
