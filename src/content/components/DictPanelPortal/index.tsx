import './_style.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Spring, config as springConfig, SpringConfig } from 'react-spring'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { WidgetState } from '../../redux/modules/widget'
import { SelectionInfo } from '@/_helpers/selection'
import { SelectionState } from '@/content/redux/modules/selection'
import { Omit } from '@/typings/helpers'

export type DictPanelPortalDispatchers = Omit<
  DictPanelDispatchers,
  'updateItemHeight' | 'updateDragArea'
>

export interface DictPanelPortalProps extends DictPanelPortalDispatchers {
  readonly isFav: boolean
  readonly isPinned: boolean
  readonly isMouseOnBowl: boolean
  readonly dictsInfo: DictPanelProps['dictsInfo']
  readonly config: DictPanelProps['config']
  readonly selection: SelectionState
}

type DictPanelState= {
  readonly propsSelection: SelectionState | null
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

  state = {
    propsSelection: null,
    x: 0,
    y: 0,
    height: 30
  }

  static getDerivedStateFromProps (
    nextProps: DictPanelPortalProps,
    prevState: DictPanelState
  ): Partial<DictPanelState> | null {
    const newSelection = nextProps.selection
    if (newSelection !== prevState.propsSelection) {
      // only re-calculate position when new selection is made
      const newState = { propsSelection: newSelection }

      if (newSelection.selectionInfo.text && !nextProps.isPinned) {
        // restore height
        const panelWidth = nextProps.config.panelWidth
        const panelHeight = 30 + nextProps.config.dicts.selected.length * 30
        newState['height'] = panelHeight

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
      iframeStyle.setProperty('hegiht', height + 'px', 'important')
      iframeStyle.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`, 'important')
      iframeStyle.setProperty('opacity', opacity, 'important')
    }
    return null
  }

  render () {
    /** @todo */
    const updateItemHeight = () => console.log('updateItemHeight')
    const updateDragArea = () => console.log('updateDragArea')

    const { selection, config, isPinned, isMouseOnBowl } = this.props

    const { x, y, height } = this.state

    const { direct, ctrl, icon, double } = config.mode
    const shouldShow: boolean = Boolean(
      this.isMount
        ? isPinned || selection.selectionInfo.text
        : isMouseOnBowl || (
          selection.selectionInfo.text && (
            direct ||
            (double && selection.dbClick) ||
            (ctrl && selection.ctrlKey)
          )
        )
    )

    if (shouldShow) {
      if (!this.isMount) {
        this.mountEL()
      }
    }

    return ReactDOM.createPortal(
      <>
        {shouldShow
          ? <DictPanel
              {...this.props}
              shouldShow={shouldShow}
              updateItemHeight={updateItemHeight}
              updateDragArea={updateDragArea}
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
          immediate={!shouldShow}
        >{this.animateFrame}</Spring>
      </>,
      this.el,
    )
  }
}
