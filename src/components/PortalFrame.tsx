import React from 'react'
import ReactDOM from 'react-dom'
import noop from 'lodash/noop'

const EVENTS = {
  onAbort: noop,
  onAbortCapture: noop,
  onAnimationEnd: noop,
  onAnimationEndCapture: noop,
  onAnimationIteration: noop,
  onAnimationIterationCapture: noop,
  onAnimationStart: noop,
  onAnimationStartCapture: noop,
  onBlur: noop,
  onBlurCapture: noop,
  onCanPlay: noop,
  onCanPlayCapture: noop,
  onCanPlayThrough: noop,
  onCanPlayThroughCapture: noop,
  onChange: noop,
  onChangeCapture: noop,
  onClick: noop,
  onClickCapture: noop,
  onCompositionEnd: noop,
  onCompositionEndCapture: noop,
  onCompositionStart: noop,
  onCompositionStartCapture: noop,
  onCompositionUpdate: noop,
  onCompositionUpdateCapture: noop,
  onContextMenu: noop,
  onContextMenuCapture: noop,
  onCopy: noop,
  onCopyCapture: noop,
  onCut: noop,
  onCutCapture: noop,
  onDoubleClick: noop,
  onDoubleClickCapture: noop,
  onDrag: noop,
  onDragCapture: noop,
  onDragEnd: noop,
  onDragEndCapture: noop,
  onDragEnter: noop,
  onDragEnterCapture: noop,
  onDragExit: noop,
  onDragExitCapture: noop,
  onDragLeave: noop,
  onDragLeaveCapture: noop,
  onDragOver: noop,
  onDragOverCapture: noop,
  onDragStart: noop,
  onDragStartCapture: noop,
  onDrop: noop,
  onDropCapture: noop,
  onDurationChange: noop,
  onDurationChangeCapture: noop,
  onEmptied: noop,
  onEmptiedCapture: noop,
  onEncrypted: noop,
  onEncryptedCapture: noop,
  onEnded: noop,
  onEndedCapture: noop,
  onError: noop,
  onErrorCapture: noop,
  onFocus: noop,
  onFocusCapture: noop,
  onInput: noop,
  onInputCapture: noop,
  onInvalid: noop,
  onInvalidCapture: noop,
  onKeyDown: noop,
  onKeyDownCapture: noop,
  onKeyPress: noop,
  onKeyPressCapture: noop,
  onKeyUp: noop,
  onKeyUpCapture: noop,
  onLoad: noop,
  onLoadCapture: noop,
  onLoadedData: noop,
  onLoadedDataCapture: noop,
  onLoadedMetadata: noop,
  onLoadedMetadataCapture: noop,
  onLoadStart: noop,
  onLoadStartCapture: noop,
  onMouseDown: noop,
  onMouseDownCapture: noop,
  onMouseEnter: noop,
  onMouseLeave: noop,
  onMouseMove: noop,
  onMouseMoveCapture: noop,
  onMouseOut: noop,
  onMouseOutCapture: noop,
  onMouseOver: noop,
  onMouseOverCapture: noop,
  onMouseUp: noop,
  onMouseUpCapture: noop,
  onPaste: noop,
  onPasteCapture: noop,
  onPause: noop,
  onPauseCapture: noop,
  onPlay: noop,
  onPlayCapture: noop,
  onPlaying: noop,
  onPlayingCapture: noop,
  onProgress: noop,
  onProgressCapture: noop,
  onRateChange: noop,
  onRateChangeCapture: noop,
  onScroll: noop,
  onScrollCapture: noop,
  onSeeked: noop,
  onSeekedCapture: noop,
  onSeeking: noop,
  onSeekingCapture: noop,
  onSelect: noop,
  onSelectCapture: noop,
  onStalled: noop,
  onStalledCapture: noop,
  onSubmit: noop,
  onSubmitCapture: noop,
  onSuspend: noop,
  onSuspendCapture: noop,
  onTimeUpdate: noop,
  onTimeUpdateCapture: noop,
  onToggle: noop,
  onToggleCapture: noop,
  onTouchCancel: noop,
  onTouchCancelCapture: noop,
  onTouchEnd: noop,
  onTouchEndCapture: noop,
  onTouchMove: noop,
  onTouchMoveCapture: noop,
  onTouchStart: noop,
  onTouchStartCapture: noop,
  onTransitionEnd: noop,
  onTransitionEndCapture: noop,
  onVolumeChange: noop,
  onVolumeChangeCapture: noop,
  onWaiting: noop,
  onWaitingCapture: noop,
  onWheel: noop,
  onWheelCapture: noop,
}

export type PortalFrameProps = {
  head?: string
  name?: string
  bodyClassName?: string
  frameDidMount?: (ref: HTMLIFrameElement) => any
  frameDidLoad?: (ref: HTMLIFrameElement) => any
  frameWillUnmount?: () => any
  [k: string]: any
}

type PortalFrameState = {
  root: HTMLElement | null
}

export default class PortalFrame extends React.PureComponent<PortalFrameProps, PortalFrameState> {
  static displayName = 'PortalFrame'

  frame: HTMLIFrameElement | null = null

  state = {
    root: null
  }

  _setRef = el => this.frame = el

  _handleLoad = () => {
    const frame = this.frame as HTMLIFrameElement
    const doc = frame.contentDocument as Document
    const root = doc.querySelector('html')
    doc.body.remove()
    this.setState({ root }, () => {
      if (this.props.frameDidLoad) {
        this.props.frameDidLoad(frame)
      }
    })
  }

  componentDidMount () {
    if (this.frame) {
      if (this.props.frameDidMount) {
        this.props.frameDidMount(this.frame)
      }
      this.frame.addEventListener('load', this._handleLoad, true)
    }
  }

  componentWillUnmount () {
    if (this.frame) {
      this.frame.removeEventListener('load', this._handleLoad, true)
    }
    if (this.props.frameWillUnmount) {
      this.props.frameWillUnmount()
    }
    this.frame = null
  }

  render () {
    const {
      importantStyle,
      frameDidLoad,
      frameDidMount,
      frameWillUnmount,
      head,
      name,
      bodyClassName,
      children,
      ...restProps
    } = this.props

    const {
      root,
    } = this.state

    return (
      <iframe
        {...restProps}
        ref={this._setRef}
        name={name || 'React Portal Frame'}
        srcDoc={`<!DOCTYPE html><html><head>${head || ''}</head></html>`}
      >
        {root &&
          ReactDOM.createPortal(
            <body {...EVENTS} className={bodyClassName} children={children} />,
            root
          )
        }
      </iframe>
    )
  }
}
