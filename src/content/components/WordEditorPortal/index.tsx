import React from 'react'
import ReactDOM from 'react-dom'
import PortalFrame from '@/components/PortalFrame'
import WordEditor, { WordEditorProps } from '../WordEditor'
import { SelectionInfo } from '@/_helpers/selection'
import { saveWord, getWordsByText } from '@/_helpers/record-manager'
import { Omit } from '@/typings/helpers'
import { Spring } from 'react-spring'

const saveToNotebook = (info: SelectionInfo) => saveWord('notebook', info)
const getWordsByTextFromNotebook = (text: string) => getWordsByText('notebook', text)

export interface WordEditorPortalProps extends Omit<
  WordEditorProps,
  'saveToNotebook' | 'getWordsByText'
> {
  shouldWordEditorShow: boolean
  isAnimation: boolean
}

export default class WordEditorPortal extends React.Component<WordEditorPortalProps> {
  isMount = false
  root = document.body
  el = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  frameHead = '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + (
    process.env.NODE_ENV === 'production'
      ? `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('wordeditor.css')}" />`
      : document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')[1].outerHTML
  )

  mountEL = () => {
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.root.removeChild(this.el)
    this.isMount = false
  }

  frameDidMount = (frame: HTMLIFrameElement) => {
    this.frame = frame
  }

  frameWillUnmount = () => {
    this.frame = null
    setTimeout(this.unmountEL, 100)
  }

  animateFrame = ({ opacity }) => {
    if (this.frame) {
      this.frame.style.setProperty('opacity', opacity, 'important')
    }
    return null
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.shouldWordEditorShow !== this.props.shouldWordEditorShow
  }

  render () {
    const {
      shouldWordEditorShow,
      isAnimation,
      ...restProps,
    } = this.props

    if (shouldWordEditorShow && !this.isMount) {
      this.mountEL()
    }

    return ReactDOM.createPortal(
      shouldWordEditorShow
        ? (
          <>
            <PortalFrame
              className='saladict-WordEditor'
              name='saladict-word-editor'
              frameBorder='0'
              head={this.frameHead}
              frameDidMount={this.frameDidMount}
              frameWillUnmount={this.frameWillUnmount}
            >
              {React.createElement(WordEditor, {
                ...restProps,
                saveToNotebook,
                getWordsByText: getWordsByTextFromNotebook,
              })}
            </PortalFrame>
            <Spring from={{ opacity: 0 }} to={{ opacity: 1 }} render={this.animateFrame} immediate={!isAnimation} />
          </>
        )
        : null,
      this.el,
    )
  }
}
