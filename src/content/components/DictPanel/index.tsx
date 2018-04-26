import './panel.scss'
import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import PortalFrame from '@/components/PortalFrame'

import MenuBar, { MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemDispatchers } from '../DictItem'

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers

export interface DictPanelProps extends DictPanelDispatchers {
  readonly shouldShow: boolean

  readonly isFav: boolean
  readonly isPinned: boolean
  readonly dictsInfo: DictionariesState['dicts']
  readonly config: AppConfig

  readonly frameDidMount: (frame: HTMLIFrameElement) => any
  readonly frameWillUnmount: () => any
}

export default class DictPanel extends React.Component<DictPanelProps> {
  frameHead = process.env.NODE_ENV === 'production'
    ? `<link type="text/css" rel="stylesheet" href="${browser.runtime.getURL('content.css')}" />`
    : Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map(link => link.outerHTML)
      .join('\n')

  shouldComponentUpdate (nextProps: DictPanelProps) {
    return nextProps.shouldShow
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
          handleDragStart,
          searchText,
          addToNotebook,
          removeFromNotebook,
          shareImg,
          pinPanel,
          closePanel,
        })}
        <div className='panel-DictContainer'>
          {Object.keys(dictsInfo).map(id => React.createElement(DictItem, {
            key: id,
            id: id as DictID,
            dictURL: allDictsConfig[id].page,
            fontSize: config.fontSize,
            preferredHeight: allDictsConfig[id].preferredHeight,
            panelWidth: config.panelWidth,
            searchStatus: dictsInfo[id].searchStatus,
            searchResult: dictsInfo[id].searchResult,
            searchText,
            updateItemHeight,
          }))}
        </div>
      </PortalFrame>
    )
  }
}
