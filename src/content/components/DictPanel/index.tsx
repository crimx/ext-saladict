import React from 'react'
import { DictionariesState } from '../../redux/modules/dictionaries'
import { AppConfig, DictID, DictConfigs, MtaAutoUnfold } from '@/app-config'
import { SelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'

import MenuBar, { MenuBarProps, MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemProps, DictItemDispatchers } from '../DictItem'

const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__

export type DictPanelDispatchers = DictItemDispatchers & MenuBarDispatchers & {
  readonly searchText: (arg?: { id?: DictID, info?: SelectionInfo | string }) => any
  readonly searchBoxUpdate: (arg: { text: string, index: number }) => any
  readonly updateItemHeight: (id: DictID | '_mtabox', height: number) => any
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
  readonly panelMaxHeightRatio: number
  readonly mtaAutoUnfold: MtaAutoUnfold
  readonly dictionaries: DictionariesState['dictionaries']
  readonly allDictsConfig: DictConfigs
  readonly langCode: AppConfig['langCode']
  readonly selection: MsgSelection
}

interface DictPanelState {
  mtaBoxHeight: number
}

export default class DictPanel extends React.Component<DictPanelProps, DictPanelState> {
  bigSearchBoxRef = React.createRef<HTMLTextAreaElement>()

  state = {
    mtaBoxHeight: 0
  }

  searchText = (arg?: { id?: DictID, info?: SelectionInfo | string }) => {
    if (this.state.mtaBoxHeight !== 0) {
      this.setState({ mtaBoxHeight: 0 })
    }
    return this.props.searchText(arg)
  }

  toggleMtaBox = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) { e.currentTarget.blur() }
    this.setState(preState => {
      return { mtaBoxHeight: preState.mtaBoxHeight <= 0
        ? window.innerHeight * this.props.panelMaxHeightRatio * 0.4
        : 0
      }
    })
  }

  handleMtaBoxInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.searchBoxUpdate({
      index: this.props.searchBoxIndex,
      text: e.currentTarget.value
    })
  }

  handleMtaBoxKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      this.searchText()
    }
  }

  componentDidMount () {
    if (this.props.mtaAutoUnfold === 'always' ||
        this.props.mtaAutoUnfold === 'popup' && isSaladictPopupPage
    ) {
      this.toggleMtaBox()
    }
  }

  componentDidUpdate (prevProps: DictPanelProps, prevState: DictPanelState) {
    if (prevState.mtaBoxHeight <= 0 &&
        this.state.mtaBoxHeight > 0 &&
        this.bigSearchBoxRef.current
    ) {
      this.bigSearchBoxRef.current.focus()
    }

    if (prevState.mtaBoxHeight !== this.state.mtaBoxHeight) {
      this.props.updateItemHeight('_mtabox', this.state.mtaBoxHeight)
    }

    if (prevProps.mtaAutoUnfold !== this.props.mtaAutoUnfold) {
      this.toggleMtaBox()
    }
  }

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
      searchBoxUpdate,
      searchBoxText,
      searchBoxIndex,
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
      mtaBoxHeight,
    } = this.state

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
          searchText: this.searchText,
          searchBoxUpdate,
          searchBoxText,
          searchBoxIndex,
          requestFavWord,
          shareImg,
          panelPinSwitch,
          closePanel,
        })}
        <div className='panel-DictContainer'>
          <div className='panel-BigSearchBox' style={{ height: mtaBoxHeight }}>
            {mtaBoxHeight > 0 && (
              <textarea
                ref={this.bigSearchBoxRef}
                value={searchBoxText}
                onChange={this.handleMtaBoxInput}
                onKeyDown={this.handleMtaBoxKeyDown}
                style={{ fontSize: this.props.fontSize }}
              />
            )}
          </div>
          <button className='panel-BigSearchBoxBtn' onClick={this.toggleMtaBox}>
            <svg width='10' height='10' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'
             className={'panel-BigSearchBoxBtn_Arrow' + (mtaBoxHeight > 0 ? ' isActive' : '')}
            >
              <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
            </svg>
          </button>
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
              searchText: this.searchText,
              updateItemHeight,
            })
          })}
        </div>
      </div>
    )
  }
}
