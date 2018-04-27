import './panel.scss'
import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import PortalFrame from '@/components/PortalFrame'

import MenuBar, { MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemDispatchers } from '../DictItem'

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers & {
  searchText: (arg?: { id?: DictID, info?: SelectionInfo | string }) => any
}

export interface DictPanelProps extends DictPanelDispatchers {
  readonly isNewSelection: boolean
  readonly isMouseOnBowl: boolean
  readonly isFav: boolean
  readonly isPinned: boolean
  readonly dictsInfo: DictionariesState['dicts']
  readonly config: AppConfig
  readonly selection: MsgSelection

  readonly frameDidMount: (frame: HTMLIFrameElement) => any
  readonly frameWillUnmount: () => any
}

export default class DictPanel extends React.Component<DictPanelProps> {
  frameHead = '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + (
    process.env.NODE_ENV === 'production'
      ? `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('content.css')}" />`
      : Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .map(link => link.outerHTML)
        .join('\n')
  )

  readyToSearchText () {
    const { config, selection, isPinned, isMouseOnBowl, searchText } = this.props
    if (isMouseOnBowl) {
      searchText({ info: selection.selectionInfo })
    } else if (isPinned) {
      if (selection.selectionInfo.text && (
          config.pinMode.direct ||
          (config.pinMode.double && selection.dbClick) ||
          (config.pinMode.ctrl && selection.ctrlKey)
        )
      ) {
        searchText({ info: selection.selectionInfo })
      }
    } else {
      if (selection.selectionInfo.text && (
          config.mode.direct ||
          (config.mode.double && selection.dbClick) ||
          (config.mode.ctrl && selection.ctrlKey)
        )
      ) {
        searchText({ info: selection.selectionInfo })
      }
    }
  }

  componentDidMount () {
    this.readyToSearchText()
  }

  componentDidUpdate () {
    if (this.props.isNewSelection) {
      this.readyToSearchText()
    }
  }

  render () {
    const {
      isFav,
      isPinned,
      handleDragStart,
      searchText,
      addToNotebook,
      removeFromNotebook,
      shareImg,
      pinPanel,
      closePanel,
      selection,

      dictsInfo,
      config,
      updateItemHeight,
    } = this.props

    const allDictsConfig = config.dicts.all

    // wrap iframe into DictPanel so that react
    // can release memory correctly after removed from DOM
    return (
      <PortalFrame
        className='saladict-DictPanel'
        name='saladict-frame'
        frameBorder='0'
        head={this.frameHead}
        frameDidMount={this.props.frameDidMount}
        frameWillUnmount={this.props.frameWillUnmount}
      >
        {React.createElement(MenuBar, {
          isFav,
          isPinned,
          selection,
          handleDragStart,
          searchText,
          addToNotebook,
          removeFromNotebook,
          shareImg,
          pinPanel,
          closePanel,
        })}
        <div className='panel-DictContainer'>
          {config.dicts.selected.map(id => React.createElement(DictItem, {
            key: id,
            id: id as DictID,
            dictURL: allDictsConfig[id].page,
            fontSize: config.fontSize,
            preferredHeight: allDictsConfig[id].preferredHeight,
            panelWidth: config.panelWidth,
            searchStatus: (dictsInfo[id] as any).searchStatus,
            searchResult: (dictsInfo[id] as any).searchResult,
            searchText,
            updateItemHeight,
          }))}
        </div>
      </PortalFrame>
    )
  }
}
