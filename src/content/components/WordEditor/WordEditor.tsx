import React, { FC } from 'react'
import { Notes, NotesProps } from './Notes'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WordEditorProps extends NotesProps {}

export const WordEditor: FC<WordEditorProps> = props => {
  return (
    <div className={`${SALADICT_EXTERNAL} saladict-theme`}>
      <Notes {...props} />
    </div>
  )
}
