import React, { FC } from 'react'
import { WordEditorPanel, WordEditorPanelProps } from './WordEditorPanel'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WordEditorProps extends WordEditorPanelProps {
  dictPanelWidth: number
}

export const WordEditor: FC<WordEditorProps> = props => {
  const { dictPanelWidth, ...restProps } = props
  return (
    <div className={`wordEditor-Container ${SALADICT_EXTERNAL}`}>
      <div
        className="wordEditor-PanelContainer"
        style={{ width: window.innerWidth - dictPanelWidth - 40 }}
      >
        <WordEditorPanel {...restProps} />
      </div>
    </div>
  )
}

export default WordEditor
