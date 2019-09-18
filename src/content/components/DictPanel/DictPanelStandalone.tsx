import React, { FC, ReactNode } from 'react'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelStandaloneProps {
  width: number | string
  height: number | string

  withAnimation: boolean
  darkMode: boolean
  colors: {
    brand: string
    background: string
    backgroundRGB: string
    font: string
    divider: string
  }

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
        backgroundColor: props.colors.background,
        color: props.colors.font,
        '--color-brand': props.colors.brand,
        '--color-background': props.colors.background,
        '--color-rgb-background': props.colors.backgroundRGB,
        '--color-font': props.colors.font,
        '--color-divider': props.colors.divider,
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
