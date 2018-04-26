import './_style.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Spring, config as springConfig, SpringConfig } from 'react-spring'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { WidgetState } from '../../redux/modules/widget'
import { SelectionInfo } from '@/_helpers/selection'
import { SelectionState } from '@/content/redux/modules/selection'
import { Omit } from '@/typings/helpers'
import { DictID } from '@/app-config'

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'updateItemHeight' | 'handleDragStart'
> & {
  showPanel: (flag: boolean) => any
}

export interface DictPanelPortalProps extends DictPanelPortalDispatchers {
  readonly isFav: boolean
  readonly isPinned: boolean
  readonly isMouseOnBowl: boolean
  readonly dictsInfo: DictPanelProps['dictsInfo']
  readonly config: DictPanelProps['config']
  readonly selection: SelectionState
}

type DictPanelState= {
  /** hack to reduce the overhead ceremony introduced by gDSFP */
  readonly mutableArea: {
    propsSelection: SelectionState | null
    dictHeights: { [k in DictID]?: number }
  }

  readonly isDragging: boolean
  readonly isNewSelection: boolean
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
    if (newSelection !== mutableArea.propsSelection) {
      mutableArea.propsSelection = newSelection
      // only re-calculate position when new selection is made
      const newState = { isNewSelection: true }

      if (newSelection.selectionInfo.text && !nextProps.isPinned) {
        // restore height
        const panelWidth = nextProps.config.panelWidth
        const panelHeight = 30 + nextProps.config.dicts.selected.length * 30
        newState['height'] = panelHeight
        mutableArea.dictHeights = {}

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
        const { mouseX, mouseY } = newSelection
        const wWidth = window.innerWidth
        const wHeight = window.innerHeight

        let x = mouseX + panelWidth + 80 <= wWidth
          ? mouseX + 80
          : mouseX - panelWidth - 80
        if (x < 0) { x = 5 } // too left

        let y = mouseY > 60 ? mouseY - 60 : mouseY + 60 - 30
        if (y + panelHeight >= wHeight) {
          // too down
          // panel's max height is guaranteed to be 80% so it's safe to do this
          y = wHeight - panelHeight - 5
        }

        newState['x'] = x
        newState['y'] = y
      }

      return newState
    }

    return { isNewSelection: false }
  }

  frameDidMount = (frame: HTMLIFrameElement) => {
    this.frame = frame
  }

  mountEL = () => {
    this.root.appendChild(this.el)
    this.isMount = true
    this.props.showPanel(true)
  }

  unmountEL = () => {
    this.root.removeChild(this.el)
    this.isMount = false
    this.props.showPanel(false)
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
    const { selection, config, isPinned, isMouseOnBowl } = this.props

    const { x, y, height, isNewSelection, isDragging } = this.state

    const { direct, ctrl, icon, double } = config.mode
    const shouldShow = (
      (this.isMount && !isNewSelection) ||
      isPinned ||
      isMouseOnBowl ||
      (selection.selectionInfo.text && (
          direct ||
          (double && selection.dbClick) ||
          (ctrl && selection.ctrlKey)
        )
      )
    )

    if (shouldShow && !this.isMount) {
      this.mountEL()
    }

    return ReactDOM.createPortal(
      <div
        onMouseMoveCapture={isDragging ? this.handleFrameMouseMove : undefined}
        onMouseUpCapture={isDragging ? this.handleDragEnd : undefined}
        onKeyUp={this.handleFrameKeyUp}
      >
        {shouldShow
          ? <DictPanel
              {...this.props}
              shouldShow={shouldShow}
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
            opacity: shouldShow ? 1 : 0
          }}
          immediate={!shouldShow || isDragging}
        >{this.animateFrame}</Spring>
      </div>,
      this.el,
    )
  }
}
