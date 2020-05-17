import React, { FC } from 'react'
import classNames from 'classnames'
import { Notes, NotesProps } from './Notes'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface WordEditorProps extends NotesProps {
  darkMode: boolean
}

export const WordEditor: FC<WordEditorProps> = props => {
  const { darkMode, ...restProps } = props
  return (
    <div
      className={classNames(SALADICT_EXTERNAL, 'saladict-theme', { darkMode })}
    >
      <Notes {...restProps} />
    </div>
  )
}
