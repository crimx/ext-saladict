import React, { FC } from 'react'
import { Notes, NotesProps } from './Notes'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WordEditorProps extends NotesProps {
  darkMode: boolean
}

export const WordEditor: FC<WordEditorProps> = props => {
  const { darkMode, ...restProps } = props
  return (
    <div className={`${SALADICT_EXTERNAL}${darkMode ? ' darkMode' : ''}`}>
      <Notes {...restProps} />
    </div>
  )
}
