import React from 'react'
import ReactDOM from 'react-dom'
import noop from 'lodash/noop'

const EVENTS = [
  'Copy',
  'Cut',
  'Paste',
  'CompositionEnd',
  'CompositionStart',
  'CompositionUpdate',
  'KeyDown',
  'KeyPress',
  'KeyUp',
  'Focus',
  'Blur',
  'Change',
  'Input',
  'Invalid',
  'Submit',
  'Click',
  'ContextMenu',
  'DoubleClick',
  'Drag',
  'DragEnd',
  'DragEnter',
  'DragExit',
  'DragLeave',
  'DragOver',
  'DragStart',
  'Drop',
  'MouseDown',
  'MouseEnter',
  'MouseLeave',
  'MouseMove',
  'MouseOut',
  'MouseOver',
  'MouseUp',
  'Select',
  'TouchCancel',
  'TouchEnd',
  'TouchMove',
  'TouchStart',
  'Scroll',
  'Wheel',
  'Abort',
  'CanPlay',
  'CanPlayThrough',
  'DurationChange',
  'Emptied',
  'Encrypted',
  'Ended',
  'Error',
  'LoadedData',
  'LoadedMetadata',
  'LoadStart',
  'Pause',
  'Play',
  'Playing',
  'Progress',
  'RateChange',
  'Seeked',
  'Seeking',
  'Stalled',
  'Suspend',
  'TimeUpdate',
  'VolumeChange',
  'Waiting',
  'Load',
  'Error',
  'AnimationStart',
  'AnimationEnd',
  'AnimationIteration',
  'TransitionEnd',
  'Toggle'
].reduce((m, e) => {
  m[`on${e}`] = noop
  if (e !== 'MouseEnter' && e !== 'MouseLeave') {
    m[`on${e}Capture`] = noop
  }
  return m
}, {})

export type PortalFrameProps = {
  head?: string
  name?: string
  frameDidMount?: (ref: HTMLIFrameElement) => any
  frameDidLoad?: (ref: HTMLIFrameElement) => any
  frameWillUnmount?: () => any
  [k: string]: any
}

type PortalFrameState = {
  isLoad: false
} | {
  root: HTMLElement
  isLoad: true
}

export default class PortalFrame extends React.PureComponent<PortalFrameProps, PortalFrameState> {
  static displayName = 'PortalFrame'

  frame: HTMLIFrameElement | null = null

  state = {
    isLoad: false
  } as PortalFrameState

  _setRef = el => this.frame = el

  _handleLoad = () => {
    const frame = this.frame as HTMLIFrameElement
    const doc = frame.contentDocument as Document
    const root = doc.querySelector('html')
    doc.body.remove()
    this.setState({ root, isLoad: true }, () => {
      if (this.props.frameDidLoad) {
        this.props.frameDidLoad(frame)
      }
    })
  }

  componentDidMount () {
    const frame = this.frame as HTMLIFrameElement
    if (this.props.frameDidMount) {
      this.props.frameDidMount(frame)
    }
    frame && frame.addEventListener('load', this._handleLoad, true)
  }

  componentWillUnmount () {
    const frame = this.frame as HTMLIFrameElement
    frame && frame.removeEventListener('load', this._handleLoad, true)
    if (this.props.frameWillUnmount) {
      this.props.frameWillUnmount()
    }
    this.frame = null
    // just in case
    this.state['root'] = null
  }

  render () {
    const {
      importantStyle,
      frameDidLoad,
      frameDidMount,
      frameWillUnmount,
      head,
      name,
      children,
      ...restProps,
    } = this.props
    return (
      <iframe
        {...restProps}
        ref={this._setRef}
        name={name || 'React Portal Frame'}
        srcDoc={`<!DOCTYPE html><html><head>${head || ''}</head></html>`}
      >
        {this.state.isLoad
          ? ReactDOM.createPortal(
              <body {...EVENTS}>
                {' '}{children}
              </body>,
              this.state.root
            )
          : null}
      </iframe>
    )
  }
}
