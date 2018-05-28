import React from 'react'
import { DictID } from '@/app-config'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { Spring } from 'react-spring'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgOpenUrl } from '@/typings/message'

import { SearchStatus } from '@/content/redux/modules/dictionaries'
import { SelectionInfo, getDefaultSelectionInfo } from '@/_helpers/selection'
import { Mutable } from '@/typings/helpers'

export interface DictItemDispatchers {
  readonly searchText: (arg: { id: DictID } | { info: SelectionInfo }) => any
  readonly updateItemHeight: (id: DictID, height: number) => any
}

export interface DictItemProps extends DictItemDispatchers {
  readonly id: DictID
  readonly text: string
  readonly dictURL: string
  readonly fontSize: number
  readonly preferredHeight: number
  readonly panelWidth: number
  readonly searchStatus: SearchStatus
  readonly searchResult: any
  readonly isAnimation: boolean
}

export type DictItemState = {
  readonly propsSearchStatus: SearchStatus | null
  readonly propsSearchResult: any
  readonly offsetHeight: number
  readonly visibleHeight: number
  readonly isUnfold: boolean
  readonly hasError: boolean
}

export class DictItem extends React.PureComponent<DictItemProps & { t: TranslationFunction }, DictItemState> {
  bodyRef = React.createRef<HTMLDivElement>()
  prevItemHeight = 30
  initStyle = { height: 30, opacity: 0 }

  state = {
    /** same as pros */
    propsSearchStatus: null,
    propsSearchResult: null,
    /** real height of the body */
    offsetHeight: 10,
    /** final height, takes unfold and mask into account */
    visibleHeight: 10,
    isUnfold: false,
    hasError: false,
  }

  static getDerivedStateFromProps (
    nextProps: DictItemProps,
    prevState: DictItemState,
  ): Partial<DictItemState> | null {
    const {
      propsSearchResult: lastResult,
      propsSearchStatus: lastStatus,
    } = prevState
    const {
      searchResult: nextResult,
      searchStatus: nextStatus,
    } = nextProps

    if (lastResult === nextResult && lastStatus === nextStatus) {
      return null
    }

    const result: Mutable<Partial<DictItemState>> = {
      propsSearchStatus: nextStatus,
      propsSearchResult: nextResult,
      hasError: false,
    }

    switch (nextStatus) {
      case SearchStatus.OnHold:
      case SearchStatus.Searching:
        result.isUnfold = false
        result.offsetHeight = 0
        result.visibleHeight = 10
        break
      case SearchStatus.Finished:
        result.isUnfold = true
        break
    }

    return result
  }

  blurAfterClick (e) {
    e.currentTarget.blur()
  }

  calcBodyHeight (force?: boolean): Mutable<Partial<DictItemState>> | null {
    if (this.bodyRef.current) {
      const offsetHeight = Math.max(this.bodyRef.current.offsetHeight, 10) || 10
      if (force || this.state.offsetHeight !== offsetHeight) {
        return { offsetHeight, visibleHeight: Math.min(offsetHeight, this.props.preferredHeight) }
      }
    }
    return null
  }

  toggleFolding = () => {
    if (this.props.searchStatus === SearchStatus.Searching) {
      return
    }

    if (this.state.isUnfold) {
      this.setState({ isUnfold: false, visibleHeight: 10 })
    } else {
      if (this.props.searchResult) {
        const update = this.calcBodyHeight(true)
        if (update) {
          update.isUnfold = true
          update.hasError = false
          this.setState(update as DictItemState)
        } else {
          this.setState({ isUnfold: true, hasError: false })
        }
      } else {
        this.props.searchText({ id: this.props.id })
      }
    }
  }

  showFull = e => {
    this.setState(state => ({ visibleHeight: state.offsetHeight }))
    e.currentTarget.blur()
  }

  handleDictItemClick = (e: React.MouseEvent<HTMLElement>) => {
    // use background script to open new page
    if (e.target['tagName'] === 'A') {
      e.preventDefault()

      const $a = e.target as HTMLAnchorElement
      if ($a.dataset.target === 'external') {
        message.send<MsgOpenUrl>({
          type: MsgType.OpenURL,
          url: $a.href,
        })
      } else {
        this.props.searchText({
          info: getDefaultSelectionInfo({
            text: e.target['textContent'] || '',
            title: this.props.t('fromSaladict'),
            favicon: 'https://raw.githubusercontent.com/crimx/ext-saladict/dev/public/static/icon-16.png'
          }),
        })
      }
    }
  }

  handleDictURLClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    message.send<MsgOpenUrl>({
      type: MsgType.OpenURL,
      url: this.props.dictURL,
      placeholder: true,
      text: this.props.text,
    })
  }

  handleRecalcBodyHeight = () => {
    setTimeout(() => {
      if (this.bodyRef.current) {
        const offsetHeight = Math.max(this.bodyRef.current.offsetHeight, 10) || 10
        this.setState({
          offsetHeight,
          visibleHeight: offsetHeight,
          isUnfold: true,
          hasError: false,
        })
      }
    }, 0)
  }

  componentDidUpdate (prevProps: DictItemProps) {
    if (this.props.searchStatus === SearchStatus.Finished &&
        this.props.searchStatus !== prevProps.searchStatus) {
      const update = this.calcBodyHeight()
      if (update) { this.setState(update as any) }
    }

    this.props.updateItemHeight(
      this.props.id,
      this.state.visibleHeight + 20,
    )
  }

  componentDidMount () {
    this.props.updateItemHeight(
      this.props.id,
      this.state.visibleHeight + 20,
    )
  }

  componentDidCatch (error, info) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Dict Component ${this.props.id} has error: `, error, info)
    }
    this.setState({
      isUnfold: false,
      visibleHeight: 10,
      hasError: true,
    })
  }

  render () {
    const {
      t,
      id,
      dictURL,
      fontSize,
      searchStatus,
      searchResult,
      isAnimation,
    } = this.props

    const {
      offsetHeight,
      visibleHeight,
      isUnfold,
      hasError,
    } = this.state

    return (
      <section className='panel-DictItem' onClick={this.handleDictItemClick}>
        <header className='panel-DictItem_Header' onClick={this.toggleFolding}>
          <img className='panel-DictItem_Logo' src={require('@/components/dictionaries/' + id + '/favicon.png')} alt='dict logo' />
          <h1 className='panel-DictItem_Title'>
            <a href={dictURL} onClick={this.handleDictURLClick}>{t(`dict:${id}`)}</a>
          </h1>
          { searchStatus === SearchStatus.Searching && !hasError &&
            <div className='panel-DictItem_Loader'>
              <div className='panel-DictItem_Loader_Ball' />
              <div className='panel-DictItem_Loader_Ball' />
              <div className='panel-DictItem_Loader_Ball' />
              <div className='panel-DictItem_Loader_Ball' />
              <div className='panel-DictItem_Loader_Ball' />
            </div>
          }
          <button className={'panel-DictItem_FoldArrowBtn'} onClick={this.blurAfterClick}>
            <svg className={`panel-DictItem_FoldArrow ${isUnfold ? 'isActive' : ''}`} width='18' height='18' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
              <path d='M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58' />
            </svg>
          </button>
        </header>
        <Spring from={this.initStyle} to={{ height: visibleHeight, opacity: isUnfold ? 1 : 0 }} immediate={!isAnimation}>
          {({ height, opacity }) => (
            <div className='panel-DictItem_Body'
              key={id}
              style={{ fontSize, height }}
            >
              <article ref={this.bodyRef} className='panel-DictItem_BodyMesure' style={{ opacity }}>
                {searchResult && !hasError &&
                  React.createElement(
                    require('@/components/dictionaries/' + id + '/View.tsx').default,
                    {
                      result: searchResult,
                      recalcBodyHeight: this.handleRecalcBodyHeight,
                    }
                  )
                }
              </article>
              {isUnfold && searchResult && visibleHeight < offsetHeight &&
                <button
                  className={'panel-DictItem_FoldMask'}
                  onClick={this.showFull}
                >
                  <svg className='panel-DictItem_FoldMaskArrow' width='15' height='15' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
                  </svg>
                </button>
              }
            </div>
          )}
        </Spring>
      </section>
    )
  }
}

export default translate()(DictItem)
