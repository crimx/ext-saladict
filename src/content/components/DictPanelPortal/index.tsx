import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { Omit } from '@/typings/helpers'
import PortalFrame from '@/components/PortalFrame'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'handleDragAreaTouchStart' | 'handleDragAreaMouseDown'
> & {
  panelOnDrag: (x: number, y: number) => any
}

export type ChildrenProps =
  DictPanelPortalDispatchers &
  Omit<
    DictPanelProps,
    'panelWidth' |
    'handleDragAreaTouchStart' |
    'handleDragAreaMouseDown'
  >

export interface DictPanelPortalProps extends ChildrenProps {
  readonly isAnimation: boolean
  readonly shouldPanelShow: boolean
  readonly panelRect: {
    x: number
    y: number
    width: number
    height: number
  }
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

  frameHead = '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + (
    process.env.NODE_ENV === 'production'
      ? `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('panel.css')}" />`
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
                    if (reader.result.indexOf('wordEditor') !== -1) {
                      link.remove()
                    }
                  }
                  reader.readAsText(b)
                })
            })
        </script>
        `
  )

  state = {
    isDragging: false,
  }

  constructor (props) {
    super(props)
    this.el.className = 'saladict-DIV'
  }

  mountEL = () => {
    // body could be replaced by other scripts
    if (!isSaladictPopupPage) { this.root = document.body }
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.frame = null
    // body could be replaced by other scripts
    if (!isSaladictPopupPage) { this.root = document.body }
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

    if (isSaladictInternalPage) {
      this.lastMouseX = clientX
      this.lastMouseY = clientY
    } else {
      // e is from iframe, so there is offset
      this.lastMouseX = clientX + this.props.panelRect.x
      this.lastMouseY = clientY + this.props.panelRect.y
    }

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

    style.setProperty('left', `${x}px`, 'important')
    style.setProperty('top', `${y}px`, 'important')
    style.setProperty('width', width + 'px', 'important')
    if (!isSaladictPopupPage) {
      style.setProperty('height', height + 'px', 'important')
    }
  }

  handlePanelEntered = (node: HTMLElement) => {
    this.frame = node as HTMLIFrameElement
    const { x, y, width, height } = this.props.panelRect
    const style = node.style

    style.setProperty('left', `${x}px`, 'important')
    style.setProperty('top', `${y}px`, 'important')
    style.setProperty('width', width + 'px', 'important')
    if (!isSaladictPopupPage) {
      style.setProperty('height', height + 'px', 'important')
    }
  }

  frameDidMount (iframe: HTMLIFrameElement) {
    if (process.env.NODE_ENV === 'production') {
      const doc = iframe.contentDocument
      if (doc && !doc.head.innerHTML.includes('panel.css')) {
        const $link = doc.createElement('link')
        $link.type = 'text/css'
        $link.rel = 'stylesheet'
        $link.href = browser.runtime.getURL('panel.css')
        doc.head.appendChild($link)
      }
    }
  }

  componentDidUpdate () {
    if (this.frame) {
      const { x, y, width, height } = this.props.panelRect
      const style = this.frame.style
      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
      style.setProperty('width', width + 'px', 'important')
      if (!isSaladictPopupPage) {
        style.setProperty('height', height + 'px', 'important')
      }
    }
  }

  renderDictPanel = () => {
    const {
      isAnimation,
    } = this.props

    const {
      isDragging,
    } = this.state

    const frameClassName = 'saladict-DictPanel'
      + (isAnimation ? ' isAnimate' : '')
      + (isDragging ? ' isDragging' : '')

    return (
      isSaladictInternalPage
        ? <div className={'panel-StyleRoot ' + frameClassName}>
            <DictPanel
              {...this.props}
              panelWidth={this.props.panelRect.width}
              handleDragAreaMouseDown={this.handleDragAreaMouseDown}
              handleDragAreaTouchStart={this.handleDragAreaTouchStart}
            />
          </div>
        : <PortalFrame
            className={frameClassName}
            bodyClassName='panel-FrameBody'
            name='saladict-dictpanel'
            frameBorder='0'
            head={this.frameHead}
            frameDidMount={this.frameDidMount}
          >
            <DictPanel
              {...this.props}
              panelWidth={this.props.panelRect.width}
              handleDragAreaMouseDown={this.handleDragAreaMouseDown}
              handleDragAreaTouchStart={this.handleDragAreaTouchStart}
            />
          </PortalFrame>
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
        className='saladict-DIV'
        onMouseMoveCapture={!isSaladictInternalPage && isDragging ? this.handleFrameMouseMove : undefined}
        onTouchMoveCapture={!isSaladictInternalPage && isDragging ? this.handleFrameTouchMove : undefined}
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
