import './_style.scss'
import React, { KeyboardEvent, MouseEvent } from 'react'
import { DictID } from '@/app-config'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { Motion, spring } from 'react-motion'
import { openURL } from '@/_helpers/browser-api'

import { SearchStatus } from '@/content/redux/modules/dictionaries'

export type DictItemProps = {
  id: DictID
  dictURL: string
  fontSize: number
  preferredHeight: number
  panelWidth: number
  searchStatus: SearchStatus
  searchResult: any
  requestSearchText: () => any
  updateItemHeight: ({ id, height }: { id: DictID, height: number }) => any
}

export type DictItemState = {
  copySearchStatus: SearchStatus | null
  bodyHeight: number
  displayHeight: number
  isUnfold: boolean
}

export class DictItem extends React.PureComponent<DictItemProps & { t: TranslationFunction }, DictItemState> {
  bodyRef = React.createRef<HTMLElement>()
  prevItemHeight = 0

  state = {
    copySearchStatus: null,
    bodyHeight: 10,
    displayHeight: 10,
    isUnfold: false,
  }

  static getDerivedStateFromProps (
    nextProps: DictItemProps,
    prevState: DictItemState,
  ): Partial<DictItemState> | null {
    if (prevState.copySearchStatus === nextProps.searchStatus) {
      return null
    }

    const newState: Partial<DictItemState> = {
      copySearchStatus: nextProps.searchStatus
    }

    switch (nextProps.searchStatus) {
      case SearchStatus.Searching:
        newState.isUnfold = false
        newState.bodyHeight = 0
        break
      case SearchStatus.Finished:
        newState.isUnfold = true
        break
    }

    return newState
  }

  blurAfterClick (e) {
    e.currentTarget.blur()
  }

  calcBodyHeight (force?: boolean): Partial<DictItemState> | null {
    if (this.bodyRef.current) {
      const bodyHeight = Math.max(this.bodyRef.current.offsetHeight, 10) || 10
      if (force || this.state.bodyHeight !== bodyHeight) {
        return { bodyHeight, displayHeight: Math.min(bodyHeight, this.props.preferredHeight) }
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
          update.isUnfold = true
          this.setState(update as any)
        } else {
          this.setState({ isUnfold: true })
        }
      } else {
        this.props.requestSearchText()
      }
    }
  }

  showFull = e => {
    this.setState(state => ({ displayHeight: state.bodyHeight }))
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
      preferredHeight,
      searchStatus,
      searchResult,
      updateItemHeight,
    } = this.props

    const {
      bodyHeight,
      displayHeight,
      isUnfold,
    } = this.state

    const finalBodyHeight = isUnfold ? displayHeight : 10

    // plus header
    const itemHeight = finalBodyHeight + 20
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
        <Motion defaultStyle={{ height: 10, opacity: 0 }}
          style={{ height: spring(finalBodyHeight), opacity: spring(isUnfold ? 1 : 0) }}
        >
          {({ height, opacity }) => (
            <div className='panel-DictItem_Body'
              style={{ fontSize, height }}
            >
              <article ref={this.bodyRef} style={{ opacity }}>
                {React.createElement(require('@/components/dictionaries/' + id + '/View.tsx').default, { result: searchResult })}
                <button className={`panel-DictItem_FoldMask ${displayHeight < bodyHeight ? 'isActive' : ''}`} onClick={this.showFull}>
                  <svg className='panel-DictItem_FoldMaskArrow' width='15' height='15' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56' />
                  </svg>
                </button>
              </article>
            </div>
          )}
        </Motion>
      </section>
    )
  }
}

export default translate()(DictItem)
