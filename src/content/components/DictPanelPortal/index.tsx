import React from 'react'
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'
import { DictID, DictConfigs } from '@/app-config'

const isSaladictPopupPage = Boolean(window['__SALADICT_POPUP_PAGE__'])

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'handleDragStart'
> & {
  panelOnDrag: (x: number, y: number) => any
}

export interface DictPanelPortalProps extends DictPanelPortalDispatchers {
  readonly isAnimation: boolean
  readonly allDictsConfig: DictConfigs
  readonly fontSize: number

  readonly isFav: boolean
  readonly isPinned: boolean
  readonly isPanelAppear: boolean
  readonly shouldPanelShow: boolean
  readonly panelRect: {
    x: number
    y: number
    width: number
    height: number
  }

  readonly dictionaries: DictPanelProps['dictionaries']

  readonly selection: MsgSelection
}

type DictPanelState= {
  readonly isDragging: boolean
}

export default class DictPanelPortal extends React.Component<DictPanelPortalProps, DictPanelState> {
  isMount = false
  root = isSaladictPopupPage
    ? document.getElementById('frame-root') as HTMLDivElement
    : document.body
  el = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  initStyle = { x: 0, y: 0, height: 30, width: 400, opacity: 0 }
  lastMouseX = 0
  lastMouseY = 0
  isAnimating = false
  _frameAnimationEndTimeout: any

  state = {
    isDragging: false,
  }

  frameDidMount = (frame: HTMLIFrameElement) => {
    this.frame = frame
  }

  mountEL = () => {
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.root.removeChild(this.el)
    this.isMount = false
  }

  frameWillUnmount = () => {
    this.frame = null
    setTimeout(this.unmountEL, 100)
  }

  animateFrame = ({ x, y, height, width, opacity }) => {
    if (this.frame) {
      const iframeStyle = this.frame.style
      if (!this.isAnimating) {
        this.isAnimating = true
        iframeStyle.setProperty('left', '0', 'important')
        iframeStyle.setProperty('top', '0', 'important')
        iframeStyle.setProperty('will-change', 'transform', 'important')
      }

      iframeStyle.setProperty('width', width + 'px', 'important')
      iframeStyle.setProperty('height', height + 'px', 'important')

      if (!isSaladictPopupPage) {
        iframeStyle.setProperty('opacity', opacity, 'important')
        iframeStyle.setProperty('transform', `translate(${x}px, ${y}px)`, 'important')
      }
    }
    this.debouncedFrameAnimationEnd()
    return null
  }

  panelImmediateCtrl = (key: string) => {
    if (!this.props.isAnimation ||
        !this.props.shouldPanelShow ||
        this.props.isPanelAppear
    ) {
      return true
    }

    if (this.state.isDragging) {
      switch (key) {
        case 'x':
        case 'y':
          return true
        default:
          break
      }
    }

    return false
  }

  debouncedFrameAnimationEnd = () => {
    clearTimeout(this._frameAnimationEndTimeout)
    if (!this.props.shouldPanelShow || this.state.isDragging) {
      return
    }
    this._frameAnimationEndTimeout = setTimeout(this.onFrameAnimationEnd, 100)
  }

  onFrameAnimationEnd = () => {
    this.isAnimating = false
    if (this.frame) {
      // remove hardware acceleration to prevent blurry font
      const iframeStyle = this.frame.style
      const { x, y } = this.props.panelRect
      iframeStyle.setProperty('left', x + 'px', 'important')
      iframeStyle.setProperty('top', y + 'px', 'important')
      iframeStyle.removeProperty('transform')
      iframeStyle.removeProperty('opacity')
      iframeStyle.removeProperty('will-change')
    }
  }

  handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // prevent mousedown dragging
    e.preventDefault()
    e.stopPropagation()
    // e is from iframe, so there is offset
    this.lastMouseX = e.clientX + this.props.panelRect.x
    this.lastMouseY = e.clientY + this.props.panelRect.y
    this.setState({ isDragging: true })
    window.addEventListener('mousemove', this.handleWindowMouseMove, { capture: true })
    window.addEventListener('mouseup', this.handleDragEnd, { capture: true })
  }

  handleDragEnd = () => {
    this.setState({ isDragging: false })
    window.removeEventListener('mousemove', this.handleWindowMouseMove, { capture: true })
    window.removeEventListener('mouseup', this.handleDragEnd, { capture: true })
  }

  handleWindowMouseMove = (e: MouseEvent) => {
    e.stopPropagation()
    const { x, y } = this.props.panelRect
    this.props.panelOnDrag(
      x + e.clientX - this.lastMouseX,
      y + e.clientY - this.lastMouseY,
    )
    this.lastMouseX = e.clientX
    this.lastMouseY = e.clientY
  }

  handleFrameMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const { x, y } = this.props.panelRect
    this.props.panelOnDrag(
      x + x + e.clientX - this.lastMouseX,
      y + y + e.clientY - this.lastMouseY,
    )
    this.lastMouseX = e.clientX + x
    this.lastMouseY = e.clientY + y
  }

  handleFrameKeyUp = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === 'Escape') {
      this.props.closePanel()
    }
  }

  render () {
    const {
      shouldPanelShow,
    } = this.props

    const { isDragging } = this.state
    const { x, y, width, height } = this.props.panelRect

    if (shouldPanelShow && !this.isMount) {
      this.mountEL()
    }

    return ReactDOM.createPortal(
      <div
        onMouseMoveCapture={isDragging ? this.handleFrameMouseMove : undefined}
        onMouseUpCapture={isDragging ? this.handleDragEnd : undefined}
        onKeyUp={this.handleFrameKeyUp}
      >
        {shouldPanelShow
          ? <DictPanel
              {...this.props}
              panelWidth={width}
              handleDragStart={this.handleDragStart}
              frameDidMount={this.frameDidMount}
              frameWillUnmount={this.frameWillUnmount}
            />
          : null
        }
        <Spring
          from={this.initStyle}
          to={{
            x, y, height, width,
            opacity: shouldPanelShow ? 1 : 0
          }}
          immediate={this.panelImmediateCtrl}
          onRest={this.debouncedFrameAnimationEnd}
        >{this.animateFrame}</Spring>
      </div>,
      this.el,
    )
  }
}
