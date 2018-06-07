import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID, DictConfigs } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import PortalFrame from '@/components/PortalFrame'
import { Omit } from '@/typings/helpers'

import MenuBar, { MenuBarProps, MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemProps, DictItemDispatchers } from '../DictItem'

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers & {
  searchText: (arg?: { id?: DictID, info?: SelectionInfo | string }) => any
}

type ChildrenProps =
  DictPanelDispatchers &
  Omit<MenuBarProps,
    'searchHistory'
  > &
  Omit<DictItemProps,
    'id' |
    'text' |
    'dictURL' |
    'preferredHeight' |
    'searchStatus' |
    'searchResult'
  >

export interface DictPanelProps extends ChildrenProps {
  readonly isDragging: boolean
  readonly dictionaries: DictionariesState['dictionaries']
  readonly allDictsConfig: DictConfigs
  readonly langCode: AppConfig['langCode']
  readonly isAnimation: boolean
  readonly selection: MsgSelection
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
      isDragging,

      isFav,
      isPinned,
      langCode,
      handleDragAreaMouseDown,
      handleDragAreaTouchStart,
      searchText,
      openWordEditor,
      shareImg,
      panelPinSwitch,
      closePanel,
      selection,

      dictionaries,

      allDictsConfig,
      panelWidth,
      fontSize,
      panelDbSearch,
      isAnimation,

      updateItemHeight,
    } = this.props

    const {
      dicts: dictsInfo,
      active: activeDicts,
    } = dictionaries

    const frameClassName = 'saladict-DictPanel'
      + (isAnimation ? ' isAnimate' : '')
      + (isDragging ? ' isDragging' : '')

    // wrap iframe into DictPanel so that react
    // can release memory correctly after removed from DOM
    return (
      <PortalFrame
        className={frameClassName}
        bodyClassName={isAnimation ? 'isAnimate' : undefined}
        name='saladict-frame'
        frameBorder='0'
        head={this.frameHead}
      >
        {React.createElement(MenuBar, {
          isFav,
          isPinned,
          searchHistory: dictionaries.searchHistory,
          handleDragAreaMouseDown,
          handleDragAreaTouchStart,
          searchText,
          openWordEditor,
          shareImg,
          panelPinSwitch,
          closePanel,
        })}
        <div className='panel-DictContainer'>
          {activeDicts.map(id => {
            let dictURL = allDictsConfig[id].page
            if (typeof dictURL !== 'string') {
              dictURL = dictURL[langCode] || dictURL.en
            }

            return React.createElement(DictItem, {
              key: id,
              id,
              text: (dictionaries.searchHistory[0] || selection.selectionInfo).text,
              dictURL,
              fontSize,
              panelDbSearch,
              preferredHeight: allDictsConfig[id].preferredHeight,
              panelWidth,
              searchStatus: (dictsInfo[id] as any).searchStatus,
              searchResult: (dictsInfo[id] as any).searchResult,
              searchText,
              updateItemHeight,
            })
          })}
        </div>
      </PortalFrame>
    )
  }
}
