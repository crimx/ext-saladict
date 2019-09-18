import React, { FC } from 'react'
import { WordEditorPanel, WordEditorPanelProps } from './WordEditorPanel'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WordEditorProps extends WordEditorPanelProps {
  width: number
  darkMode: boolean
}

export const WordEditor: FC<WordEditorProps> = props => {
  const { width, darkMode, ...restProps } = props
  return (
    <div
      className={`wordEditor-Container ${SALADICT_EXTERNAL}${
        darkMode ? ' darkMode' : ''
      }`}
    >
      <div className="wordEditor-PanelContainer" style={{ width }}>
        <WordEditorPanel {...restProps} />
      </div>
    </div>
  )
}

export default WordEditor
