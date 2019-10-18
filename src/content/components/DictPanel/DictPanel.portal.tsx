import React, { FC, useRef, useState } from 'react'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { DictPanel, DictPanelProps } from './DictPanel'
import { SALADICT_PANEL } from '@/_helpers/saladict'
import { useUpdateEffect } from 'react-use'

export interface DictPanelPortalProps extends DictPanelProps {
  show: boolean
  withAnimation: boolean
  panelCSS: string
}

export const DictPanelPortal: FC<DictPanelPortalProps> = props => {
  const { show: showProps, panelCSS, ...restProps } = props
  const showRef = useRef(showProps)
  const [show, setShow] = useState(showProps)

  useUpdateEffect(() => {
    setShow(showProps)
  }, [showProps])

  useUpdateEffect(() => {
    if (props.takeCoordSnapshot) {
      showRef.current = show
    } else {
      setShow(showRef.current)
    }
  }, [props.takeCoordSnapshot])

  return (
    <ShadowPortal
      id="saladict-dictpanel-root"
      head={<style>{require('./DictPanel.shadow.scss').toString()}</style>}
      shadowRootClassName={SALADICT_PANEL}
      panelCSS={panelCSS}
      in={show}
      timeout={props.withAnimation ? defaultTimeout : 0}
    >
      {() => <DictPanel {...restProps} />}
    </ShadowPortal>
  )
}

export default DictPanelPortal
