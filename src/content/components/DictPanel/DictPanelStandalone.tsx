import React, { FC, ReactNode } from 'react'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelStandaloneProps {
  width: number | string
  height: number | string

  withAnimation: boolean

  menuBar: ReactNode
  mtaBox: ReactNode
  dictList: ReactNode
  waveformBox: ReactNode
}

export const DictPanelStandalone: FC<DictPanelStandaloneProps> = props => {
  return (
    <div
      className={
        `dictPanel-Root ${SALADICT_PANEL}` +
        (props.withAnimation ? ' isAnimate' : '')
      }
      style={{
        width: props.width,
        height: props.height,
        backgroundColor: '#fff',
        color: '#333',
        '--panel-background-color': '#fff',
        '--panel-color': '#333',
        '--panel-width': props.width + 'px',
        '--panel-max-height': props.height + 'px'
      }}
    >
      <div className="dictPanel-Head">{props.menuBar}</div>
      <div className="dictPanel-Body">
        {props.mtaBox}
        {props.dictList}
      </div>
      {props.waveformBox}
    </div>
  )
}

export default DictPanelStandalone
