import React, { FC, useRef } from 'react'
import ReactDOM from 'react-dom'
import { SaladBowlShadow, SaladBowlShadowProps } from './SaladBowl.shadow'

export type SaladBowlPortalProps = SaladBowlShadowProps

/**
 * React portal wrapped SaladBowlShadow.
 * Detach from DOM when not visible.
 */
export const SaladBowlPortal: FC<SaladBowlPortalProps> = props => {
  const nodeRef = useRef(document.createElement('div'))
  nodeRef.current.className = 'saladict-div'

  if (props.show) {
    if (!nodeRef.current.parentElement) {
      document.body.appendChild(nodeRef.current)
    }
  } else {
    if (nodeRef.current.parentElement) {
      nodeRef.current.remove()
    }
  }

  return ReactDOM.createPortal(<SaladBowlShadow {...props} />, nodeRef.current)
}
