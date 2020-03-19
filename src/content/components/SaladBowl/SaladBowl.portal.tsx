import React, { FC, useState } from 'react'
import { SaladBowl, SaladBowlProps } from './SaladBowl'
import ShadowPortal from '@/components/ShadowPortal'

const animationTimeout = { enter: 1000, exit: 100, appear: 1000 }

export interface SaladBowlPortalProps extends Omit<SaladBowlProps, 'onHover'> {
  show: boolean
  panelCSS: string
}

/**
 * React portal wrapped SaladBowlShadow.
 * Detach from DOM when not visible.
 */
export const SaladBowlPortal: FC<SaladBowlPortalProps> = props => {
  const { show, panelCSS, ...restProps } = props
  const [isHover, setHover] = useState(false)

  return (
    <ShadowPortal
      id="saladict-saladbowl-root"
      head={<style>{require('./SaladBowl.shadow.scss').toString()}</style>}
      classNames="saladbowl"
      panelCSS={panelCSS}
      in={show || isHover}
      timeout={props.withAnimation ? animationTimeout : 0}
    >
      {() => <SaladBowl {...restProps} onHover={setHover} />}
    </ShadowPortal>
  )
}
