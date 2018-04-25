import './_style.scss'
import React from 'react'
import { DictID } from '@/app-config'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { Spring } from 'react-spring'
import { openURL } from '@/_helpers/browser-api'

import { SearchStatus } from '@/content/redux/modules/dictionaries'

export interface DictItemDispatchers {
  readonly searchText: () => any
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
}

export type DictItemState = {
  readonly copySearchStatus: SearchStatus | null
  readonly offsetHeight: number
  readonly visibleHeight: number
  readonly isUnfold: boolean
}

export class DictItem extends React.PureComponent<DictItemProps & { t: TranslationFunction }, DictItemState> {
  bodyRef = React.createRef<HTMLElement>()
  prevItemHeight = 30
  initStyle = { height: 10, opacity: 0 }

  state = {
    copySearchStatus: null,
    offsetHeight: 10,
    visibleHeight: 10,
    isUnfold: false,
  }

  static getDerivedStateFromProps (
    nextProps: DictItemProps,
    prevState: DictItemState,
  ): Partial<DictItemState> | null {
    if (prevState.copySearchStatus === nextProps.searchStatus) {
      return null
    }

    switch (nextProps.searchStatus) {
      case SearchStatus.Searching:
        return {
          copySearchStatus: nextProps.searchStatus,
          isUnfold: false,
          offsetHeight: 0,
        }
      case SearchStatus.Finished:
        return {
          copySearchStatus: nextProps.searchStatus,
          isUnfold: true,
        }
    }

    return { copySearchStatus: nextProps.searchStatus }
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
      this.setState({ isUnfold: false })
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
        this.props.searchText()
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
  }

  render () {
    const {
      t,
      id,
      dictURL,
      fontSize,
      searchStatus,
      searchResult,
      updateItemHeight,
    } = this.props

    const {
      offsetHeight,
      visibleHeight,
      isUnfold,
    } = this.state

    const displayHeight = isUnfold ? visibleHeight : 10

    // plus header
    const itemHeight = displayHeight + 20
    if (itemHeight !== this.prevItemHeight) {
      this.prevItemHeight = itemHeight
      updateItemHeight({ id, height: itemHeight })
    }

    return (
      <section className='panel-DictItem'>
        <header className='panel-DictItem_Header' onClick={this.toggleFolding}>
          <img className='panel-DictItem_Logo' src={require('@/components/dictionaries/' + id + '/favicon.png')} alt='dict logo' />
          <h1 className='panel-DictItem_Title'>
            <a href={dictURL} onClick={this.openDictURL}>{t(`dict_${id}`)}</a>
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
        <Spring from={this.initStyle} to={{ height: displayHeight, opacity: isUnfold ? 1 : 0 }}>
          {({ height, opacity }) => (
            <div className='panel-DictItem_Body'
              key={id}
              style={{ fontSize, height }}
            >
              <article ref={this.bodyRef} style={{ opacity }}>
                {React.createElement(require('@/components/dictionaries/' + id + '/View.tsx').default, { result: searchResult })}
                <button className={`panel-DictItem_FoldMask ${visibleHeight < offsetHeight ? 'isActive' : ''}`} onClick={this.showFull}>
                  <svg className='panel-DictItem_FoldMaskArrow' width='15' height='15' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
                  </svg>
                </button>
              </article>
            </div>
          )}
        </Spring>
      </section>
    )
  }
}

export default translate()(DictItem)
