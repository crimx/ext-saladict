import React, { FC } from 'react'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { DictPanel, DictPanelProps } from './DictPanel'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelPortalProps extends DictPanelProps {
  show: boolean
  withAnimation: boolean
  panelCSS: string
}

export const DictPanelPortal: FC<DictPanelPortalProps> = props => {
  const { withAnimation, show, panelCSS, ...restProps } = props
  return (
    <ShadowPortal
      id="saladict-dictpanel-root"
      head={<style>{require('./DictPanel.shadow.scss').toString()}</style>}
      shadowRootClassName={SALADICT_PANEL}
      panelCSS={panelCSS}
      in={show}
      timeout={withAnimation ? defaultTimeout : 0}
    >
      {() => <DictPanel withAnimation={withAnimation} {...restProps} />}
    </ShadowPortal>
  )
}

export default DictPanelPortal
