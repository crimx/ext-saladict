import React from 'react'
import { DictID } from '@/app-config'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { Spring } from 'react-spring'
import { openURL } from '@/_helpers/browser-api'

import { SearchStatus } from '@/content/redux/modules/dictionaries'

export interface DictItemDispatchers {
  readonly searchText: ({ id: DictID }) => any
  readonly updateItemHeight: ({ id, height }: { id: DictID, height: number }) => any
}

export interface DictItemProps extends DictItemDispatchers {
  readonly id: DictID
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

    switch (nextStatus) {
      case SearchStatus.OnHold:
      case SearchStatus.Searching:
        return {
          propsSearchStatus: nextStatus,
          propsSearchResult: nextResult,
          isUnfold: false,
          offsetHeight: 0,
          visibleHeight: 10,
        }
      case SearchStatus.Finished:
        return {
          propsSearchStatus: nextStatus,
          propsSearchResult: nextResult,
          isUnfold: true,
        }
    }

    return { propsSearchStatus: nextStatus, propsSearchResult: nextResult }
  }

  blurAfterClick (e) {
    e.currentTarget.blur()
  }

  calcBodyHeight (force?: boolean) {
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
          update['isUnfold'] = true
          this.setState(update)
        } else {
          this.setState({ isUnfold: true })
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

  openDictURL = e => {
    openURL(this.props.dictURL)
    e.preventDefault()
    e.stopPropagation()
  }

  componentDidUpdate (prevProps: DictItemProps) {
    if (this.props.searchStatus === SearchStatus.Finished &&
        this.props.searchStatus !== prevProps.searchStatus) {
      const update = this.calcBodyHeight()
      if (update) { this.setState(update as any) }
    }

    this.props.updateItemHeight({
      id: this.props.id,
      height: this.state.visibleHeight + 20,
    })
  }

  componentDidMount () {
    this.props.updateItemHeight({
      id: this.props.id,
      height: this.state.visibleHeight + 20,
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
    } = this.state

    return (
      <section className='panel-DictItem'>
        <header className='panel-DictItem_Header' onClick={this.toggleFolding}>
          <img className='panel-DictItem_Logo' src={require('@/components/dictionaries/' + id + '/favicon.png')} alt='dict logo' />
          <h1 className='panel-DictItem_Title'>
            <a href={dictURL} onClick={this.openDictURL}>{t(`dict:${id}`)}</a>
          </h1>
          { searchStatus === SearchStatus.Searching &&
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
              <div ref={this.bodyRef} className='panel-DictItem_BodyMesure'>
                <article style={{ opacity }}>
                  {searchResult && React.createElement(require('@/components/dictionaries/' + id + '/View.tsx').default, { result: searchResult })}
                  {isUnfold &&
                    <button
                      className={`panel-DictItem_FoldMask ${visibleHeight < offsetHeight ? 'isActive' : ''}`}
                      onClick={this.showFull}
                    >
                      <svg className='panel-DictItem_FoldMaskArrow' width='15' height='15' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
                      </svg>
                    </button>
                  }
                </article>
              </div>
            </div>
          )}
        </Spring>
      </section>
    )
  }
}

export default translate()(DictItem)
