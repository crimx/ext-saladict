import React from 'react'
import ReactDOM from 'react-dom'
import PortalFrame from '@/components/PortalFrame'
import WordEditor, { WordEditorProps } from '../WordEditor'
import { getWordsByText } from '@/_helpers/record-manager'
import { Omit } from '@/typings/helpers'
import CSSTransition from 'react-transition-group/CSSTransition'

const getWordsByTextFromNotebook = (text: string) => getWordsByText('notebook', text)

export interface WordEditorPortalProps extends Omit<
  WordEditorProps,
  'getWordsByText'
> {
  shouldWordEditorShow: boolean
  isAnimation: boolean
}

export default class WordEditorPortal extends React.Component<WordEditorPortalProps> {
  isMount = false
  root = document.body
  el = document.createElement('div')
  frameHead = '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + (
    process.env.NODE_ENV === 'production'
      ? `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('wordeditor.css')}" />`
      : Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .map(link => link.outerHTML)
        .join('\n')
        + `
        <script>
          document.querySelectorAll('link')
            .forEach(link => {
              return fetch(link.href)
                .then(r => r.blob())
                .then(b => {
                  var reader = new FileReader();
                  reader.onload = function() {
                    if (reader.result.indexOf('wordEditor') === -1) {
                      link.remove()
                    }
                  }
                  reader.readAsText(b)
                })
            })
        </script>
        `
  )

  mountEL = () => {
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.root.removeChild(this.el)
    this.isMount = false
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.shouldWordEditorShow !== this.props.shouldWordEditorShow
  }

  renderEditor = () => {
    const {
      isAnimation,
      ...restProps,
    } = this.props

    return (
      <PortalFrame
        className={'saladict-WordEditor' + (isAnimation ? ' isAnimate' : '')}
        name='saladict-word-editor'
        frameBorder='0'
        head={this.frameHead}
      >
        <WordEditor
          {...restProps}
          getWordsByText={getWordsByTextFromNotebook}
        />
      </PortalFrame>
    )
  }

  render () {
    const {
      shouldWordEditorShow,
      isAnimation,
    } = this.props

    if (shouldWordEditorShow && !this.isMount) {
      this.mountEL()
    }

    return ReactDOM.createPortal(
      <CSSTransition
        classNames='saladict-WordEditor'
        in={shouldWordEditorShow}
        timeout={500}
        mountOnEnter={true}
        unmountOnExit={true}
        enter={isAnimation}
        exit={isAnimation}
        onExited={this.unmountEL}
      >
        {this.renderEditor}
      </CSSTransition>,
      this.el,
    )
  }
}
