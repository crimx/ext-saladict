import React from 'react'
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'
import { DictID } from '@/app-config'

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'updateItemHeight' | 'handleDragStart'
>

export interface DictPanelPortalProps extends DictPanelPortalDispatchers {
  readonly isFav: boolean
  readonly isPinned: boolean
  readonly isPanelAppear: boolean
  readonly shouldPanelShow: boolean
  readonly dictionaries: DictPanelProps['dictionaries']
  readonly config: DictPanelProps['config']
  readonly selection: MsgSelection
}

type DictPanelState= {
  /** hack to reduce the overhead ceremony introduced by gDSFP */
  readonly mutableArea: {
    propsSelection: MsgSelection | null
    dictHeights: { [k in DictID]?: number }
  }

  readonly isDragging: boolean
  readonly x: number
  readonly y: number
  readonly height: number
}

export default class DictPanelPortal extends React.Component<DictPanelPortalProps, DictPanelState> {
  isMount = false
  root = document.body
  el = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  initStyle = { x: 0, y: 0, height: 30, width: 400, opacity: 0 }
  lastMouseX = 0
  lastMouseY = 0

  state = {
    mutableArea: {
      propsSelection: null,
      dictHeights: {},
    },

    isDragging: false,
    isNewSelection: false,
    x: 0,
    y: 0,
    height: 30
  }

  static getDerivedStateFromProps (
    nextProps: DictPanelPortalProps,
    prevState: DictPanelState
  ): Partial<DictPanelState> | null {
    const newSelection = nextProps.selection
    const mutableArea = prevState.mutableArea
    const oldSelection = mutableArea.propsSelection
    if (newSelection !== oldSelection) {
      mutableArea.propsSelection = newSelection
      const newText = newSelection.selectionInfo.text
      // only re-calculate position when new selection is made
      if (newSelection.force || (newText && !nextProps.isPinned)) {
        // restore height
        // when word editor shows up, only relocate the panel
        const isWordEditorMsg = newSelection.force && oldSelection && newText === oldSelection.selectionInfo.text
        const panelWidth = nextProps.config.panelWidth
        const panelHeight = isWordEditorMsg ? prevState.height : 30 + nextProps.config.dicts.selected.length * 30
        if (!isWordEditorMsg) { mutableArea.dictHeights = {} }

        // icon position           10px  panel position
        //             +-------+         +------------------------+
        //             |       |         |                        |
        //             |       | 30px    |                        |
        //        60px +-------+         |                        |
        //             |  30px           |                        |
        //             |                 |                        |
        //       40px  |                 |                        |
        //     +-------+                 |                        |
        // cursor
        const { mouseX, mouseY, force } = newSelection
        const wWidth = window.innerWidth
        const wHeight = window.innerHeight

        let x = force
          ? mouseX
          : mouseX + panelWidth + 80 <= wWidth
            ? mouseX + 80
            : mouseX - panelWidth - 80
        if (x < 0) { x = 10 } // too left

        let y = force
          ? mouseY
          : mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
        if (y + panelHeight >= wHeight) {
          // too down
          // panel's max height is guaranteed to be 80% so it's safe to do this
          y = wHeight - panelHeight - 10
        }

        return { x, y, height: panelHeight }
      }
    }

    return null
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
      iframeStyle.setProperty('width', width + 'px', 'important')
      iframeStyle.setProperty('height', height + 'px', 'important')
      iframeStyle.setProperty('transform', `translate(${x}px, ${y}px)`, 'important')
      iframeStyle.setProperty('opacity', opacity, 'important')
      if (this.state.isDragging) {
        iframeStyle.setProperty('will-change', 'transform', 'important')
      } else {
        iframeStyle.removeProperty('will-change')
      }
    }
    return null
  }

  updateItemHeight = ({ id, height }: { id: DictID, height: number }) => {
    const dictHeights = this.state.mutableArea.dictHeights
    if (dictHeights[id] !== height) {
      dictHeights[id] = height

      const winHeight = window.innerHeight
      const newHeight = Math.min(
        winHeight * this.props.config.panelMaxHeightRatio,
        30 + this.props.config.dicts.selected
          .reduce((sum, id) => sum + (dictHeights[id] || 30), 0),
      )

      if (this.state.y + newHeight + 10 > winHeight) {
        this.setState({ height: newHeight, y: winHeight - 10 - newHeight })
      } else {
        this.setState({ height: newHeight })
      }
    }
  }

  handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // prevent mousedown dragging
    e.preventDefault()
    e.stopPropagation()
    // e is from iframe, so there is offset
    this.lastMouseX = e.clientX + this.state.x
    this.lastMouseY = e.clientY + this.state.y
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
    const { x, y } = this.state
    this.setState({
      x: x + e.clientX - this.lastMouseX,
      y: y + e.clientY - this.lastMouseY,
    })
    this.lastMouseX = e.clientX
    this.lastMouseY = e.clientY
  }

  handleFrameMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const { x, y } = this.state
    this.setState({
      x: x + x + e.clientX - this.lastMouseX,
      y: y + y + e.clientY - this.lastMouseY,
    })
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

    const isAnimation = this.props.config.animation

    const { x, y, height, isDragging } = this.state

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
              updateItemHeight={this.updateItemHeight}
              handleDragStart={this.handleDragStart}
              frameDidMount={this.frameDidMount}
              frameWillUnmount={this.frameWillUnmount}
            />
          : null
        }
        <Spring
          from={this.initStyle}
          to={{
            x, y, height,
            width: this.props.config.panelWidth,
            opacity: shouldPanelShow ? 1 : 0
          }}
          immediate={!isAnimation || !shouldPanelShow || isDragging}
        >{this.animateFrame}</Spring>
      </div>,
      this.el,
    )
  }
}
