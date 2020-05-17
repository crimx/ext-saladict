import React, { FC, ReactNode } from 'react'
import classNames from 'classnames'
import { SALADICT_PANEL } from '@/_helpers/saladict'

export interface DictPanelStandaloneProps {
  width: string
  height: string
  fontSize: number

  withAnimation: boolean
  darkMode: boolean
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
        className={classNames(
          SALADICT_PANEL,
          'dictPanel-Root',
          'saladict-theme',
          {
            isAnimate: props.withAnimation,
            darkMode: props.darkMode
          }
        )}
        style={{
          width: props.width,
          height: props.height,
          '--panel-width': props.width,
          '--panel-max-height': props.height,
          '--panel-font-size': props.fontSize + 'px'
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
