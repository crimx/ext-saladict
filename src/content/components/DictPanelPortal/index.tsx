import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'
import { AppConfig, DictConfigs } from '@/app-config'

const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__

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

interface DictPanelState {
  readonly isDragging: boolean
}

export default class DictPanelPortal extends React.Component<DictPanelPortalProps, DictPanelState> {
  isMount = false
  root = isSaladictPopupPage
    ? document.getElementById('frame-root') as HTMLDivElement
    : document.body
  el = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  lastMouseX = 0
  lastMouseY = 0

  state = {
    isDragging: false,
  }

  mountEL = () => {
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.frame = null
    this.root.removeChild(this.el)
    this.isMount = false
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

    if (this.frame) {
      this.frame.style.setProperty('will-change', 'top, left', 'important')
    }
  }

  handleDragEnd = () => {
    this.setState({ isDragging: false })
    window.removeEventListener('mousemove', this.handleWindowMouseMove, { capture: true })
    window.removeEventListener('touchmove', this.handleWindowTouchMove, { capture: true })
    window.removeEventListener('mouseup', this.handleDragEnd, { capture: true })
    window.removeEventListener('touchend', this.handleDragEnd, { capture: true })

    if (this.frame) {
      this.frame.style.removeProperty('will-change')
    }
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

  handlePanelEnter = (node: HTMLElement) => {
    this.frame = node as HTMLIFrameElement
    const { x, y, width, height } = this.props.panelRect
    const style = node.style

    style.setProperty('width', width + 'px', 'important')
    style.setProperty('height', height + 'px', 'important')
    style.setProperty('left', `${x}px`, 'important')
    style.setProperty('top', `${y}px`, 'important')
  }

  handlePanelEntered = (node: HTMLElement) => {
    this.frame = node as HTMLIFrameElement
    const { x, y, width, height } = this.props.panelRect
    const style = node.style

    style.setProperty('width', width + 'px', 'important')
    style.setProperty('height', height + 'px', 'important')
    style.setProperty('left', `${x}px`, 'important')
    style.setProperty('top', `${y}px`, 'important')
  }

  componentDidUpdate () {
    if (this.frame) {
      const { x, y, width, height } = this.props.panelRect
      const style = this.frame.style
      style.setProperty('width', width + 'px', 'important')
      style.setProperty('height', height + 'px', 'important')
      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
    }
  }

  renderDictPanel = () => {
    return (
      <DictPanel
        {...this.props}
        isDragging={this.state.isDragging}
        panelWidth={this.props.panelRect.width}
        handleDragAreaMouseDown={this.handleDragAreaMouseDown}
        handleDragAreaTouchStart={this.handleDragAreaTouchStart}
      />
    )
  }

  render () {
    const {
      shouldPanelShow,
      isAnimation,
    } = this.props

    const {
      isDragging,
    } = this.state

    if (shouldPanelShow && !this.isMount) {
      this.mountEL()
    }

    const shouldAnimate = isAnimation && !isSaladictPopupPage

    return ReactDOM.createPortal(
      <div
        onMouseMoveCapture={isDragging ? this.handleFrameMouseMove : undefined}
        onTouchMoveCapture={isDragging ? this.handleFrameTouchMove : undefined}
        onMouseUpCapture={isDragging ? this.handleDragEnd : undefined}
        onTouchEndCapture={isDragging ? this.handleDragEnd : undefined}
        onKeyUp={this.handleFrameKeyUp}
      >
        <CSSTransition
          classNames='saladict-DictPanel'
          in={shouldPanelShow}
          timeout={500}
          mountOnEnter={true}
          unmountOnExit={true}
          appear={isSaladictOptionsPage || isSaladictPopupPage}
          onEnter={shouldAnimate ? this.handlePanelEnter : this.handlePanelEntered}
          onEntered={shouldAnimate ? this.handlePanelEntered : undefined}
          onExited={this.unmountEL}
        >
          {this.renderDictPanel}
        </CSSTransition>
      </div>,
      this.el,
    )
  }
}
