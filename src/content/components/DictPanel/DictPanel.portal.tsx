import React, { FC, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import classnames from 'classnames'
import { useRefFn } from 'observable-hooks'
import { SALADICT_PANEL } from '@/_helpers/saladict'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { DictPanel, DictPanelProps } from './DictPanel'

export interface DictPanelPortalProps extends DictPanelProps {
  show: boolean
  withAnimation: boolean
  darkMode: boolean
  panelCSS: string
}

export const DictPanelPortal: FC<DictPanelPortalProps> = props => {
  const {
    show: showProps,
    panelCSS,
    withAnimation,
    darkMode,
    ...restProps
  } = props
  const showRef = useRef(showProps)
  const [show, setShow] = useState(showProps)

  const panelStyle = useRefFn(() => (
    <style>{require('./DictPanel.shadow.scss').toString()}</style>
  )).current

  useUpdateEffect(() => {
    setShow(showProps)
  }, [showProps])

  // Restore if panel was hidden before snapshot,
  // otherwise ignore.
  useUpdateEffect(() => {
    if (props.takeCoordSnapshot) {
      showRef.current = show
    } else if (!showRef.current) {
      setShow(false)
    }
  }, [props.takeCoordSnapshot])

  return (
    <ShadowPortal
      id="saladict-dictpanel-root"
      head={panelStyle}
      shadowRootClassName={SALADICT_PANEL}
      innerRootClassName={classnames({ isAnimate: withAnimation, darkMode })}
      panelCSS={panelCSS}
      in={show}
      timeout={props.withAnimation ? defaultTimeout : 0}
    >
      {() => <DictPanel {...restProps} />}
    </ShadowPortal>
  )
}

export default DictPanelPortal
