import React from 'react'
import { DictionariesState, SearchStatus } from '../../redux/modules/dictionaries'
import { DictID, MtaAutoUnfold, AllDicts } from '@/app-config'
import { SelectionInfo, getDefaultSelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'

import CSSTransition from 'react-transition-group/CSSTransition'

import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'

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
    't' |
    'searchHistory' |
    'activeDicts' |
    'isShowMtaBox'
  > &
  Omit<DictItemProps,
    't' |
    'id' |
    'text' |
    'preferredHeight' |
    'searchStatus' |
    'searchResult'
  >

export interface DictPanelProps extends ChildrenProps {
  readonly isAnimation: boolean
  readonly panelMaxHeightRatio: number
  readonly mtaAutoUnfold: MtaAutoUnfold
  readonly dictionaries: DictionariesState['dictionaries']
  readonly dictsConfig: {
    selected: DictID[]
    all: AllDicts
  }
  readonly selection: MsgSelection
}

interface DictPanelState {
  mtaBoxHeight: number
  audioBoxShow: boolean
  shouldLoadAudioBox: boolean
}

export class DictPanel extends React.Component<DictPanelProps & { t: TranslationFunction }, DictPanelState> {
  ContainerRef = React.createRef<HTMLMainElement>()
  MtaBoxRef = React.createRef<HTMLTextAreaElement>()

  state: DictPanelState = {
    mtaBoxHeight: 0,
    audioBoxShow: false,
    shouldLoadAudioBox: false,
  }

  searchText = (arg?: { id?: DictID, info?: SelectionInfo | string }) => {
    if (this.state.mtaBoxHeight !== 0) {
      const { mtaAutoUnfold } = this.props
      if (!mtaAutoUnfold ||
          mtaAutoUnfold === 'once' ||
          mtaAutoUnfold === 'popup' && !isSaladictPopupPage
      ) {
        this.setState({ mtaBoxHeight: 0 })
      }
    }
    return this.props.searchText(arg)
  }

  showMtaBox = (isShow: boolean) => {
    this.setState({
      mtaBoxHeight: isShow
        ? window.innerHeight * this.props.panelMaxHeightRatio / 100 * 0.4
        : 0
    })
  }

  toggleMtaBox = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) { e.currentTarget.blur() }
    this.showMtaBox(this.state.mtaBoxHeight <= 0)
  }

  handleMtaBoxInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.searchBoxUpdate({
      index: this.props.searchBox.index,
      text: e.currentTarget.value
    })
  }

  handleMtaBoxKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      if (this.props.searchBox.text) {
        return this.searchText({
          info: getDefaultSelectionInfo({
            text: this.props.searchBox.text,
            title: this.props.t('fromSaladict'),
            favicon: 'https://raw.githubusercontent.com/crimx/ext-saladict/dev/public/static/icon-16.png'
          }),
        })
      }
    }
  }

  showAudioBox = (isShow: boolean) => {
    this.setState({ audioBoxShow: isShow })
  }

  toggleAudioBox = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) { e.currentTarget.blur() }
    this.showAudioBox(!this.state.audioBoxShow)
  }

  handleAudioBoxInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.searchBoxUpdate({
      index: this.props.searchBox.index,
      text: e.currentTarget.value
    })
  }

  componentDidMount () {
    const { mtaAutoUnfold } = this.props
    if (mtaAutoUnfold === 'once' ||
        mtaAutoUnfold === 'always' ||
        mtaAutoUnfold === 'popup' && isSaladictPopupPage
    ) {
      this.showMtaBox(true)
    }

    setTimeout(() => {
      if (this.state.mtaBoxHeight > 0 && this.MtaBoxRef.current) {
        this.MtaBoxRef.current.focus()
        this.MtaBoxRef.current.select()
      }
      this.setState({ shouldLoadAudioBox: true })
    }, 100)
  }

  componentDidUpdate (prevProps: DictPanelProps, prevState: DictPanelState) {
    if (prevState.mtaBoxHeight <= 0 &&
        this.state.mtaBoxHeight > 0 &&
        this.MtaBoxRef.current
    ) {
      this.MtaBoxRef.current.focus()
    }

    if (prevState.mtaBoxHeight !== this.state.mtaBoxHeight) {
      this.props.updateItemHeight('_mtabox', this.state.mtaBoxHeight)
    }

    const { mtaAutoUnfold } = this.props
    if (prevProps.mtaAutoUnfold !== mtaAutoUnfold) {
      this.showMtaBox(
        mtaAutoUnfold === 'once' ||
        mtaAutoUnfold === 'always' ||
        mtaAutoUnfold === 'popup' && isSaladictPopupPage
      )
    }

    if (prevProps.dictionaries.searchHistory !== this.props.dictionaries.searchHistory &&
      this.ContainerRef.current
    ) {
      this.ContainerRef.current.scrollTop = 0
    }
  }

  renderMtaBox = () => (
    <textarea
      ref={this.MtaBoxRef}
      value={this.props.searchBox.text}
      onChange={this.handleMtaBoxInput}
      onKeyDown={this.handleMtaBoxKeyDown}
      style={{ fontSize: this.props.fontSize }}
    />
  )

  render () {
    const {
      t,
      activeConfigID,
      profiles,
      isAnimation,
      isFav,
      isPinned,
      isTripleCtrl,
      tripleCtrlPreload,
      handleDragAreaMouseDown,
      handleDragAreaTouchStart,
      searchBoxUpdate,
      searchBox,
      requestFavWord,
      shareImg,
      panelPinSwitch,
      closePanel,
      selection,
      searchSuggests,

      dictionaries,

      dictsConfig,
      panelWidth,
      fontSize,

      updateItemHeight,
    } = this.props

    const {
      mtaBoxHeight,
      audioBoxShow,
      shouldLoadAudioBox,
    } = this.state

    const {
      dicts: dictsInfo,
      active: activeDicts,
    } = dictionaries

    return (
      <div className={`panel-Root${isAnimation ? ' isAnimate' : ''}`}>
        {React.createElement(MenuBar, {
          t,
          activeConfigID,
          profiles,
          tripleCtrlPreload,
          isFav,
          isPinned,
          isTripleCtrl,
          searchSuggests,
          searchHistory: dictionaries.searchHistory,
          activeDicts: dictionaries.active,
          isShowMtaBox: mtaBoxHeight > 0,
          handleDragAreaMouseDown,
          handleDragAreaTouchStart,
          searchText: this.searchText,
          searchBoxUpdate,
          searchBox,
          requestFavWord,
          shareImg,
          panelPinSwitch,
          closePanel,
        })}
        <main className='panel-DictContainer' ref={this.ContainerRef}>
          <div className='panel-MtaBox' style={{ height: mtaBoxHeight }}>
            <CSSTransition
              classNames='panel-MtaBoxTrans'
              in={mtaBoxHeight > 0}
              timeout={500}
              mountOnEnter={true}
              unmountOnExit={true}
            >
              {this.renderMtaBox}
            </CSSTransition>
          </div>
          <button className='panel-DrawerBtn' onClick={this.toggleMtaBox}>
            <svg width='10' height='10' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'
             className={'panel-DrawerBtn_Arrow' + (mtaBoxHeight > 0 ? ' isActive' : '')}
            >
              <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
            </svg>
          </button>
          <div>
            {activeDicts.map(id => {
              const dictInfo = dictsInfo[id]
              return React.createElement(DictItem, {
                t,
                key: id,
                id,
                text: (dictionaries.searchHistory[0] || selection.selectionInfo).text,
                fontSize,
                preferredHeight: dictsConfig.all[id].preferredHeight,
                panelWidth,
                searchStatus: dictInfo ? dictInfo.searchStatus : SearchStatus.OnHold,
                searchResult: dictInfo ? dictInfo.searchResult : null,
                searchText: this.searchText,
                updateItemHeight,
              })
            })}
          </div>
        </main>
        <button className='panel-DrawerBtn' onClick={this.toggleAudioBox}>
          <svg width='10' height='10' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'
            className={'panel-DrawerBtn_Arrow' + (audioBoxShow ? ' isActive' : '')}
          >
            <path d='M 58 45.269 L 29.707 16.975 L 1.414 45.27 L 0 43.855 L 29.707 14.145 L 59.414 43.855' />
          </svg>
        </button>
        <div className='panel-AudioBox' style={{ height: audioBoxShow ? 165 : 0 }}>
          {shouldLoadAudioBox // x-frame-options: SAMEORIGIN
            ? <iframe
                className='panel-AudioBoxFrame'
                src={browser.runtime.getURL('/audio-control.html')}
                sandbox='allow-same-origin allow-scripts'
              />
            : null
          }
        </div>
      </div>
    )
  }
}

export default translate()(DictPanel)
