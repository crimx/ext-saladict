import React, { useMemo, useEffect, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import CSSTransition, {
  CSSTransitionProps
} from 'react-transition-group/CSSTransition'
import root from 'react-shadow'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export const defaultTimeout = { enter: 400, exit: 100, appear: 400 }

export const defaultClassNames = 'shadowPortal'

export interface ShadowPortalProps extends Partial<CSSTransitionProps> {
  /** Unique id for the injected element */
  id: string
  /** Static content before the children  */
  head?: ReactNode
  shadowRootClassName?: string
}

/**
 * Render a shadow DOM on Portal to a removable element with transition.
 * Insert the element to DOM when the Component mounts.
 * Remove the element from DOM when the Component unmounts.
 */
export const ShadowPortal = (props: ShadowPortalProps) => {
  const {
    id,
    head,
    shadowRootClassName,
    onEnter,
    onExited,
    ...restProps
  } = props

  const $root = useMemo(() => {
    let $root = document.getElementById(id)
    if (!$root) {
      $root = document.createElement('div')
      $root.id = id
      $root.className = 'saladict-div'
    }
    return $root
  }, [])

  // unmout element when React node unmounts
  useEffect(
    () => () => {
      if ($root.parentNode) {
        $root.remove()
      }
    },
    []
  )

  return ReactDOM.createPortal(
    <root.div
      className={
        SALADICT_EXTERNAL +
        (shadowRootClassName ? ` ${shadowRootClassName}` : '')
      }
    >
      {head}
      <CSSTransition
        classNames={defaultClassNames}
        mountOnEnter
        appear
        timeout={defaultTimeout}
        {...restProps}
        onEnter={(...args) => {
          if (!$root.parentNode) {
            document.body.appendChild($root)
          }
          if (onEnter) {
            return onEnter(...args)
          }
        }}
        onExited={(...args) => {
          if ($root.parentNode) {
            $root.remove()
          }
          if (onExited) {
            return onExited(...args)
          }
        }}
      />
    </root.div>,
    $root
  )
}

export default ShadowPortal
