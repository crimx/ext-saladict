import React, { FC, useMemo, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { SaladBowlShadow, SaladBowlShadowProps } from './SaladBowl.shadow'

export type SaladBowlPortalProps = SaladBowlShadowProps

/**
 * React portal wrapped SaladBowlShadow.
 * Detach from DOM when not visible.
 */
export const SaladBowlPortal: FC<SaladBowlPortalProps> = props => {
  const root = useMemo(getRootElement, [])

  // unmout element on React node unmount
  useEffect(() => () => root.remove(), [])

  if (props.show) {
    if (!root.parentElement) {
      document.body.appendChild(root)
    }
  } else {
    if (root.parentElement) {
      root.remove()
    }
  }

  return ReactDOM.createPortal(<SaladBowlShadow {...props} />, root)
}

function getRootElement(): HTMLElement {
  let root = document.getElementById('saladbowl-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'saladbowl-root'
    root.className = 'saladict-div'
  }
  return root
}
