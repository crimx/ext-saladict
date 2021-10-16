import React, { FC, useState } from 'react'
import { useRefFn } from 'observable-hooks'
import ShadowPortal from '@/components/ShadowPortal'
import { SaladBowl, SaladBowlProps } from './SaladBowl'

const animationTimeout = { enter: 1000, exit: 100, appear: 1000 }

export interface SaladBowlPortalProps extends Omit<SaladBowlProps, 'onHover'> {
  show: boolean
  panelCSS: string
  withAnimation: boolean
}

/**
 * React portal wrapped SaladBowlShadow.
 * Detach from DOM when not visible.
 */
export const SaladBowlPortal: FC<SaladBowlPortalProps> = props => {
  const { show, panelCSS, withAnimation, ...restProps } = props
  const [isHover, setHover] = useState(false)
  const bowlStyles = useRefFn(() => (
    <style>{require('./SaladBowl.shadow.scss').toString()}</style>
  )).current

  return (
    <ShadowPortal
      id="saladict-saladbowl-root"
      head={bowlStyles}
      classNames="saladbowl"
      innerRootClassName={withAnimation ? 'isAnimate' : ''}
      panelCSS={panelCSS}
      in={show || isHover}
      timeout={withAnimation ? animationTimeout : 0}
    >
      {() => <SaladBowl {...restProps} onHover={setHover} />}
    </ShadowPortal>
  )
}
