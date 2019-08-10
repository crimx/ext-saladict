import React, { FC } from 'react'
import { WordEditorPanel, WordEditorPanelProps } from './WordEditorPanel'

export interface WordEditorProps extends WordEditorPanelProps {
  dictPanelWidth: number
}

export const WordEditor: FC<WordEditorProps> = props => {
  const { dictPanelWidth, ...restProps } = props
  return (
    <div className="wordEditor-Container">
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
