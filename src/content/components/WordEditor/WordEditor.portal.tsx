import React, { FC } from 'react'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { WordEditor, WordEditorProps } from './WordEditor'

export interface WordEditorPortalProps extends WordEditorProps {
  show: boolean
  withAnimation: boolean
  panelCSS: string
}

export const WordEditorPortal: FC<WordEditorPortalProps> = props => {
  const { withAnimation, show, panelCSS, ...restProps } = props
  return (
    <ShadowPortal
      id="saladict-wordeditor-root"
      head={<style>{require('./WordEditor.shadow.scss').toString()}</style>}
      panelCSS={panelCSS}
      in={show}
      timeout={withAnimation ? defaultTimeout : 0}
    >
      {() => <WordEditor {...restProps} />}
    </ShadowPortal>
  )
}

export default WordEditorPortal
