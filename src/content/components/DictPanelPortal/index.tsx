import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { Omit } from '@/typings/helpers'
import PortalFrame from '@/components/PortalFrame'
import { injectAnalytics } from '@/_helpers/analytics'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictQuickSearchPage = !!window.__SALADICT_QUICK_SEARCH_PAGE__

const isStandalonePage = isSaladictPopupPage || isSaladictQuickSearchPage

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
  readonly panelCSS: string
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
  root = isStandalonePage
    ? document.getElementById('frame-root') as HTMLDivElement
    : document.body
  el = document.createElement('div')
  /** background layer when dragging to prevent event losing */
  dragBg = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  lastMouseX = 0
  lastMouseY = 0
  /** iframe head */
  frameHead: string
  /** dicts whose style are loaded */
  styledDicts: Set<string>

  state: DictPanelState = {
    isDragging: false,
  }

  constructor (props: DictPanelPortalProps) {
    super(props)
    this.el.className = 'saladict-DIV'
    this.dragBg.className = 'saladict-DragBg'

    this.styledDicts = new Set(this.props.dictsConfig.selected)

    const meta = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'

    if (process.env.NODE_ENV === 'production') {
      // load panel style and selected dict styles
      // this will reduce the initial loading time
      this.frameHead = (
        meta +
        `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('panel.css')}" />\n` +
        this.props.dictsConfig.selected.map(id =>
          `<link rel="stylesheet" href="${browser.runtime.getURL(`/dicts/${isSaladictInternalPage ? 'internal/' : ''}${id}.css`)}" />\n`
        ).join('')
      )
    } else {
      const styles = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .map(link => link.outerHTML)
        .join('\n')

      // remove wordEditor style
      this.frameHead = meta + styles + `
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
    }
  }

  mountEL = () => {
    // body could be replaced by other scripts
    if (!isStandalonePage) { this.root = document.body }
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.frame = null
    // body could be replaced by other scripts
    if (!isStandalonePage) { this.root = document.body }
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

  handleDragStart = (clientX: number, clientY: number) => {
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

    document.body.appendChild(this.dragBg)
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

    this.dragBg.remove()
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

  handleDragging = (clientX: number, clientY: number) => {
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

    if (!isStandalonePage) {
      const { x, y, width, height } = this.props.panelRect
      const style = node.style

      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
      style.setProperty('width', width + 'px', 'important')
      style.setProperty('height', height + 'px', 'important')

      if (isSaladictOptionsPage) {
        // under antd modal mask
        style.setProperty('z-index', '900', 'important')
      }
    }

    if (this.frame.contentWindow) {
      this.frame.contentWindow.document.title = isSaladictQuickSearchPage
        ? 'Saladict Quick Search Panel'
        : 'Saladict Panel'
      injectAnalytics(
        isSaladictQuickSearchPage ? '/qspanel' : '/panel',
        this.frame.contentWindow,
      )
    }
  }

  frameDidMount (iframe: HTMLIFrameElement) {
    if (process.env.NODE_ENV === 'production') {
      const doc = iframe.contentDocument
      if (doc && doc.head && !doc.head.innerHTML.includes('panel.css')) {
        const $link = doc.createElement('link')
        $link.type = 'text/css'
        $link.rel = 'stylesheet'
        $link.href = browser.runtime.getURL('panel.css')
        doc.head.appendChild($link)
      }
    }
  }

  componentDidUpdate (prevProps: DictPanelPortalProps) {
    if (!this.frame) { return }

    const { style, contentDocument } = this.frame

    if (!isStandalonePage) {
      const { x, y, width, height } = this.props.panelRect
      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
      style.setProperty('width', width + 'px', 'important')
      style.setProperty('height', height + 'px', 'important')
    }

    if (this.props.dictsConfig.selected !== prevProps.dictionaries.selected &&
        contentDocument && contentDocument.head
    ) {
      this.props.dictsConfig.selected.forEach(id => {
        if (!this.styledDicts.has(id)) {
          this.styledDicts.add(id)
          const link = contentDocument.createElement('link')
          link.rel = 'stylesheet'
          link.href = browser.runtime.getURL(`/dicts/${isSaladictInternalPage ? 'internal/' : ''}${id}.css`)
          contentDocument.head.appendChild(link)
        }
      })
    }
  }

  renderDictPanel = () => {
    const {
      isAnimation,
      panelCSS,
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
            head={this.frameHead + `\n<style>${panelCSS}</style>\n`}
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
    } = this.props

    const {
      isDragging,
    } = this.state

    if (shouldPanelShow && !this.isMount) {
      this.mountEL()
    }

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
          appear={isSaladictOptionsPage || isStandalonePage}
          onEnter={this.handlePanelEnter}
          onEntered={this.handlePanelEnter}
          onExited={this.unmountEL}
        >
          {this.renderDictPanel}
        </CSSTransition>
      </div>,
      this.el,
    )
  }
}
