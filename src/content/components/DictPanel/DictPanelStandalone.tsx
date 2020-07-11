import React, { FC, ReactNode, useRef } from 'react'
import classnames from 'classnames'
import { SALADICT_PANEL } from '@/_helpers/saladict'
import { HoverBoxContext } from '@/components/HoverBox'

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
  const rootElRef = useRef<HTMLDivElement | null>(null)

  return (
    // an extra layer for float box
    <div
      ref={rootElRef}
      className={classnames('dictPanel-FloatBox-Container', 'saladict-theme', {
        isAnimate: props.withAnimation,
        darkMode: props.darkMode
      })}
    >
      {props.panelCSS ? <style>{props.panelCSS}</style> : null}
      <div
        className={`dictPanel-Root ${SALADICT_PANEL}`}
        style={{
          width: props.width,
          height: props.height,
          '--panel-width': props.width,
          '--panel-max-height': props.height,
          '--panel-font-size': props.fontSize + 'px'
        }}
      >
        <div className="dictPanel-Head">{props.menuBar}</div>
        <HoverBoxContext.Provider value={rootElRef}>
          <div className="dictPanel-Body fancy-scrollbar">
            {props.mtaBox}
            {props.dictList}
          </div>
        </HoverBoxContext.Provider>
        {props.waveformBox}
      </div>
    </div>
  )
}

export default DictPanelStandalone
