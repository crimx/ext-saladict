import React, { FC } from 'react'
import { SaladBowl, SaladBowlProps } from './SaladBowl'
import ShadowPortal from '@/components/ShadowPortal'

const animationTimeout = { enter: 1000, exit: 100, appear: 1000 }

export interface SaladBowlPortalProps extends SaladBowlProps {
  show: boolean
}

/**
 * React portal wrapped SaladBowlShadow.
 * Detach from DOM when not visible.
 */
export const SaladBowlPortal: FC<SaladBowlPortalProps> = props => {
  const { show, ...restProps } = props
  return (
    <ShadowPortal
      id="saladict-saladbowl-root"
      head={<style>{require('./SaladBowl.shadow.scss').toString()}</style>}
      classNames="saladbowl"
      in={show}
      timeout={props.withAnimation ? animationTimeout : 0}
    >
      {() => <SaladBowl {...restProps} />}
    </ShadowPortal>
  )
}
