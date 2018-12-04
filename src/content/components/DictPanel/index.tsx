import React from 'react'
import { DictionariesState, SearchStatus } from '../../redux/modules/dictionaries'
import { DictID, AppConfig, MtaAutoUnfold } from '@/app-config'
import { SelectionInfo, getDefaultSelectionInfo } from '@/_helpers/selection'
import { MsgSelection } from '@/typings/message'
import { Omit } from '@/typings/helpers'

import CSSTransition from 'react-transition-group/CSSTransition'

import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'

import MenuBar, { MenuBarProps, MenuBarDispatchers } from '../MenuBar'
import DictItem, { DictItemProps, DictItemDispatchers } from '../DictItem'

const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__

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
  readonly dictsConfig: AppConfig['dicts']
  readonly selection: MsgSelection
}

interface DictPanelState {
  mtaBoxHeight: number
}

export class DictPanel extends React.Component<DictPanelProps & { t: TranslationFunction }, DictPanelState> {
  MtaBoxRef = React.createRef<HTMLTextAreaElement>()

  state = {
    mtaBoxHeight: 0
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
        ? window.innerHeight * this.props.panelMaxHeightRatio * 0.4
        : 0
    })
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
      if (this.props.searchBoxText) {
        return this.searchText({
          info: getDefaultSelectionInfo({
            text: this.props.searchBoxText,
            title: this.props.t('fromSaladict'),
            favicon: 'https://raw.githubusercontent.com/crimx/ext-saladict/dev/public/static/icon-16.png'
          }),
        })
      }
    }
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
  }

  renderMtaBox = () => (
    <textarea
      ref={this.MtaBoxRef}
      value={this.props.searchBoxText}
      onChange={this.handleMtaBoxInput}
      onKeyDown={this.handleMtaBoxKeyDown}
      style={{ fontSize: this.props.fontSize }}
    />
  )

  render () {
    const {
      t,
      activeConfigID,
      configProfiles,
      isAnimation,
      isFav,
      isPinned,
      isTripleCtrl,
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
      searchSuggests,

      dictionaries,

      dictsConfig,
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
          t,
          activeConfigID,
          configProfiles,
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
          searchBoxText,
          searchBoxIndex,
          requestFavWord,
          shareImg,
          panelPinSwitch,
          closePanel,
        })}
        <div className='panel-DictContainer'>
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
          <button className='panel-MtaBoxBtn' onClick={this.toggleMtaBox}>
            <svg width='10' height='10' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'
             className={'panel-MtaBoxBtn_Arrow' + (mtaBoxHeight > 0 ? ' isActive' : '')}
            >
              <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
            </svg>
          </button>
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
        {dictsConfig.selected.map(id =>
          <link key={id} rel='stylesheet' href={browser.runtime.getURL(`/dicts/${isSaladictInternalPage ? 'internal/' : ''}${id}.css`)} />
        )}
      </div>
    )
  }
}

export default translate()(DictPanel)
