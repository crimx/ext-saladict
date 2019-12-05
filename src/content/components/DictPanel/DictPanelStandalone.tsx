import React, { FC, ReactNode } from 'react'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelStandaloneProps {
  width: string
  height: string

  withAnimation: boolean
  darkMode: boolean
  colors: React.CSSProperties
  panelCSS?: string

  menuBar: ReactNode
  mtaBox: ReactNode
  dictList: ReactNode
  waveformBox: ReactNode
}

export const DictPanelStandalone: FC<DictPanelStandaloneProps> = props => {
  return (
    <React.Fragment>
      {props.panelCSS ? <style>{props.panelCSS}</style> : null}
      <div
        className={
          `dictPanel-Root ${SALADICT_PANEL}` +
          (props.withAnimation ? ' isAnimate' : '')
        }
        style={{
          ...props.colors,
          width: props.width,
          height: props.height,
          '--panel-width': props.width,
          '--panel-max-height': props.height
        }}
      >
        <div className="dictPanel-Head">{props.menuBar}</div>
        <div className="dictPanel-Body fancy-scrollbar">
          {props.mtaBox}
          {props.dictList}
        </div>
        {props.waveformBox}
      </div>
    </React.Fragment>
  )
}

export default DictPanelStandalone
