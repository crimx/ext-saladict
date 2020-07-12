import React, { FC } from 'react'
import classnames from 'classnames'
import { useRefFn } from 'observable-hooks'
import { ShadowPortal, defaultTimeout } from '@/components/ShadowPortal'
import { WordEditor, WordEditorProps } from './WordEditor'

export interface WordEditorPortalProps extends WordEditorProps {
  show: boolean
  withAnimation: boolean
  darkMode: boolean
}

export const WordEditorPortal: FC<WordEditorPortalProps> = props => {
  const { show, withAnimation, darkMode, ...restProps } = props
  const editorStyles = useRefFn(() => (
    <style>{require('./WordEditor.shadow.scss').toString()}</style>
  )).current
  return (
    <ShadowPortal
      id="saladict-wordeditor-root"
      head={editorStyles}
      in={show}
      innerRootClassName={classnames({ isAnimate: withAnimation, darkMode })}
      timeout={withAnimation ? defaultTimeout : 0}
    >
      {() => <WordEditor {...restProps} />}
    </ShadowPortal>
  )
}

export default WordEditorPortal
