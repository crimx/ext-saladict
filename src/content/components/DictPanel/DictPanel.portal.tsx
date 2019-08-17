import React, { FC } from 'react'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { DictPanel, DictPanelProps } from './DictPanel'

export interface DictPanelPortalProps extends DictPanelProps {
  show: boolean
  withAnimation: boolean
}

export const DictPanelPortal: FC<DictPanelPortalProps> = props => {
  const { withAnimation, show, ...restProps } = props
  return (
    <ShadowPortal
      id="saladict-dictpanel-root"
      head={<style>{require('./DictPanel.shadow.scss').toString()}</style>}
      in={show}
      timeout={withAnimation ? defaultTimeout : 0}
    >
      {() => <DictPanel withAnimation={withAnimation} {...restProps} />}
    </ShadowPortal>
  )
}

export default DictPanelPortal
