import React from 'react'
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'
import { AppConfig, DictConfigs } from '@/app-config'

const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'handleDragAreaTouchStart' | 'handleDragAreaMouseDown'
> & {
  panelOnDrag: (x: number, y: number) => any
}

export interface DictPanelPortalProps extends DictPanelPortalDispatchers {
  readonly isAnimation: boolean
  readonly allDictsConfig: DictConfigs
  readonly fontSize: number
  readonly langCode: AppConfig['langCode']

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
        this.props.isPanelAppear ||
        isSaladictPopupPage
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

  handleDragAreaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // prevent mousedown default dragging
    e.preventDefault()
    e.stopPropagation()
    this.handleDragStart(e.clientX, e.clientY)
  }

  handleDragAreaTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    // passive events
    // e.preventDefault()
    this.handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
  }

  handleDragStart = (clientX, clientY) => {
    const activeElement = document.activeElement as any
    if (activeElement) { activeElement.blur() }
    // e is from iframe, so there is offset
    this.lastMouseX = clientX + this.props.panelRect.x
    this.lastMouseY = clientY + this.props.panelRect.y
    this.setState({ isDragging: true })
    window.addEventListener('mousemove', this.handleWindowMouseMove, { capture: true })
    window.addEventListener('touchmove', this.handleWindowTouchMove, { capture: true })
    window.addEventListener('mouseup', this.handleDragEnd, { capture: true })
    window.addEventListener('touchend', this.handleDragEnd, { capture: true })
  }

  handleDragEnd = () => {
    this.setState({ isDragging: false })
    window.removeEventListener('mousemove', this.handleWindowMouseMove, { capture: true })
    window.removeEventListener('touchmove', this.handleWindowTouchMove, { capture: true })
    window.removeEventListener('mouseup', this.handleDragEnd, { capture: true })
    window.removeEventListener('touchend', this.handleDragEnd, { capture: true })
  }

  handleWindowMouseMove = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    this.handleDragging(e.clientX, e.clientY)
  }

  handleWindowTouchMove = (e: TouchEvent) => {
    e.stopPropagation()
    // passive events
    // e.preventDefault()
    this.handleDragging(e.touches[0].clientX, e.touches[0].clientY)
  }

  handleFrameMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const { x, y } = this.props.panelRect
    this.handleDragging(e.clientX + x, e.clientY + y)
  }

  handleFrameTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    // passive events
    // e.preventDefault()
    const { x, y } = this.props.panelRect
    this.handleDragging(e.touches[0].clientX + x, e.touches[0].clientY + y)
  }

  handleDragging = (clientX, clientY) => {
    const { x, y } = this.props.panelRect
    this.props.panelOnDrag(
      x + clientX - this.lastMouseX,
      y + clientY - this.lastMouseY,
    )
    this.lastMouseX = clientX
    this.lastMouseY = clientY
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
        onTouchMoveCapture={isDragging ? this.handleFrameTouchMove : undefined}
        onMouseUpCapture={isDragging ? this.handleDragEnd : undefined}
        onTouchEndCapture={isDragging ? this.handleDragEnd : undefined}
        onKeyUp={this.handleFrameKeyUp}
      >
        {shouldPanelShow
          ? <DictPanel
              {...this.props}
              panelWidth={width}
              handleDragAreaMouseDown={this.handleDragAreaMouseDown}
              handleDragAreaTouchStart={this.handleDragAreaTouchStart}
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
