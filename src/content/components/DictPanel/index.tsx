import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID, DictConfigs } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'

import MenuBar, { MenuBarProps, MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemProps, DictItemDispatchers } from '../DictItem'

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers & {
  searchText: (arg?: { id?: DictID, info?: SelectionInfo | string }) => any
}

type ChildrenProps =
  DictPanelDispatchers &
  Omit<MenuBarProps,
    'searchHistory' |
    'activeDicts'
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
  readonly isAnimation: boolean
  readonly dictionaries: DictionariesState['dictionaries']
  readonly allDictsConfig: DictConfigs
  readonly langCode: AppConfig['langCode']
  readonly selection: MsgSelection
}

export default class DictPanel extends React.Component<DictPanelProps> {
  render () {
    const {
      activeConfigID,
      configProfiles,
      isAnimation,
      isFav,
      isPinned,
      langCode,
      handleDragAreaMouseDown,
      handleDragAreaTouchStart,
      searchText,
      requestFavWord,
      shareImg,
      panelPinSwitch,
      closePanel,
      selection,

      dictionaries,

      allDictsConfig,
      panelWidth,
      fontSize,

      updateItemHeight,
    } = this.props

    const {
      dicts: dictsInfo,
      active: activeDicts,
    } = dictionaries

    return (
      <div className={`panel-Root${isAnimation ? ' isAnimate' : ''}`}>
        {React.createElement(MenuBar, {
          activeConfigID,
          configProfiles,
          isFav,
          isPinned,
          searchHistory: dictionaries.searchHistory,
          activeDicts: dictionaries.active,
          handleDragAreaMouseDown,
          handleDragAreaTouchStart,
          searchText,
          requestFavWord,
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
              preferredHeight: allDictsConfig[id].preferredHeight,
              panelWidth,
              searchStatus: (dictsInfo[id] as any).searchStatus,
              searchResult: (dictsInfo[id] as any).searchResult,
              searchText,
              updateItemHeight,
            })
          })}
        </div>
      </div>
    )
  }
}
