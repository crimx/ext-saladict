import React, { FC } from 'react'
import root from 'react-shadow'
import { CSSTransition } from 'react-transition-group'
import { SaladBowl, SaladBowlProps } from './SaladBowl'

export interface SaladBowlShadowProps extends SaladBowlProps {
  /** Visibility */
  readonly show: boolean
}

/**
 * Shadow DOM wrapped SaladBowl with pop-up animation.
 */
export const SaladBowlShadow: FC<SaladBowlShadowProps> = props => (
  <root.div>
    <style>{require('./style.shadow.scss').toString()}</style>
    <CSSTransition
      classNames="saladbowl"
      in={props.show}
      timeout={1000}
      enter={props.withAnimation}
      exit={false}
    >
      <SaladBowl {...props} />
    </CSSTransition>
  </root.div>
)
