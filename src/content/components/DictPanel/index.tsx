import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID, DictConfigs } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import PortalFrame from '@/components/PortalFrame'

import MenuBar, { MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemDispatchers } from '../DictItem'

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers & {
  searchText: (arg?: { id?: DictID, info?: SelectionInfo | string }) => any
}

export interface DictPanelProps extends DictPanelDispatchers {
  readonly isFav: boolean
  readonly isPinned: boolean
  readonly dictionaries: DictionariesState['dictionaries']
  readonly allDictsConfig: DictConfigs
  readonly selectedDicts: DictID[]
  readonly fontSize: number
  readonly panelWidth: number
  readonly isAnimation: boolean
  readonly selection: MsgSelection

  readonly frameDidMount: (frame: HTMLIFrameElement) => any
  readonly frameWillUnmount: () => any
}

export default class DictPanel extends React.Component<DictPanelProps> {
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

  render () {
    const {
      isFav,
      isPinned,
      handleDragStart,
      searchText,
      openWordEditor,
      shareImg,
      panelPinSwitch,
      closePanel,
      selection,

      dictionaries,

      allDictsConfig,
      selectedDicts,
      panelWidth,
      fontSize,
      isAnimation,

      updateItemHeight,
    } = this.props

    const dictsInfo = dictionaries.dicts

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
          searchHistory: dictionaries.searchHistory,
          handleDragStart,
          searchText,
          openWordEditor,
          shareImg,
          panelPinSwitch,
          closePanel,
        })}
        <div className={`panel-DictContainer${isAnimation ? ' isAnimate' : ''}`}>
          {selectedDicts.map(id => React.createElement(DictItem, {
            key: id,
            id,
            text: (dictionaries.searchHistory[0] || selection.selectionInfo).text,
            dictURL: allDictsConfig[id].page,
            fontSize,
            preferredHeight: allDictsConfig[id].preferredHeight,
            panelWidth,
            isAnimation,
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
