import './_style.scss'
import React, { KeyboardEvent, MouseEvent } from 'react'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { SelectionInfo } from '@/_helpers/selection'
import { openURL } from '@/_helpers/browser-api'

export type MenuBarProps = {
  isFav: boolean
  isPinned: boolean
  updateDragArea: ({ left, width }: { left: number, width: number }) => any
  searchText: (text: string) => any
  addToNotebook: () => any
  removeFromNotebook: () => any
  shareImg: () => any
  pinPanel: () => any
  closePanel: () => any
}

export class MenuBar extends React.PureComponent<MenuBarProps & { t: TranslationFunction }> {
  dragAreaRef = React.createRef<HTMLDivElement>()
  text = ''

  openSettings () { openURL('options.html', true) }

  openHistory () { openURL('history.html', true) }

  updateDragArea = () => {
    const el = this.dragAreaRef.current
    if (el) {
      this.props.updateDragArea({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }

  handleSearchBoxInput = (e: KeyboardEvent<HTMLInputElement>) => {
    this.text = e.currentTarget.value
  }

  handleSearchBoxKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (this.text && e.key === 'Enter') {
      this.props.searchText(this.text)
    }
  }

  handleIconSearchClick = (e: MouseEvent<SVGElement>) => {
    if (this.text) {
      this.props.searchText(this.text)
    }
  }

  handleIconFavClick = (e: MouseEvent<SVGElement>) => {
    switch (e.button) {
      case 0: // main button
        if (this.props.isFav) {
          this.props.removeFromNotebook()
        } else {
          this.props.addToNotebook()
        }
        break
      case 2: // secondary button
        openURL('notebook.html', true)
        break
    }
  }

  render () {
    const {
      t,
      isFav,
      isPinned,
      shareImg,
      pinPanel,
      closePanel,
    } = this.props

    return (
      <header className='panel-MenuBar'>
        <input type='text'
          className='panel-MenuBar_SearchBox'
          onInput={this.handleSearchBoxInput}
          onKeyUp={this.handleSearchBoxKeyUp}
          onTransitionEnd={this.updateDragArea}
        />

        <svg
          className='panel-MenuBar_IconSearch'
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52.966 52.966'
          onClick={this.handleIconSearchClick}
        >
          <title>{t('tipSearchText')}</title>
          <path d='M51.704 51.273L36.844 35.82c3.79-3.8 6.14-9.04 6.14-14.82 0-11.58-9.42-21-21-21s-21 9.42-21 21 9.42 21 21 21c5.082 0 9.747-1.817 13.383-4.832l14.895 15.49c.196.206.458.308.72.308.25 0 .5-.093.694-.28.398-.382.41-1.015.028-1.413zM21.984 40c-10.478 0-19-8.523-19-19s8.522-19 19-19 19 8.523 19 19-8.525 19-19 19z'/>
        </svg>

        <div className='panel-MenuBar_DragArea' />

        <svg
          className='panel-MenuBar_IconSettings'
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 612 612'
          onClick={this.openSettings}
        >
          <title>{t('tipOpenSettings')}</title>
          <path d='M0 97.92v24.48h612V97.92H0zm0 220.32h612v-24.48H0v24.48zm0 195.84h612V489.6H0v24.48z'/>
        </svg>

        <svg
          className={`panel-MenuBar_IconFav ${isFav ? 'isActive' : ''}`}
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'
          onClick={this.handleIconFavClick}
        >
          <title>{t('tipAddToNotebook')}</title>
          <path d='M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z'></path>
        </svg>

        <svg
          className='panel-MenuBar_IconHistory'
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'
          onClick={this.openHistory}
        >
          <title>{t('tipOpenHistory')}</title>
          <path d='M34.688 3.315c-15.887 0-28.812 12.924-28.81 28.73-.012.25-.157 4.434 1.034 8.94l-3.88-2.262c-.965-.56-2.193-.235-2.76.727-.557.96-.233 2.195.728 2.755l9.095 5.302c.02.01.038.013.056.022.1.05.2.09.31.12.07.02.14.05.21.07.09.02.176.02.265.03.06.003.124.022.186.022.036 0 .07-.01.105-.015.034 0 .063.007.097.004.05-.003.097-.024.146-.032.097-.017.19-.038.28-.068.08-.028.157-.06.23-.095.086-.04.165-.085.24-.137.074-.046.14-.096.206-.15.07-.06.135-.125.198-.195.06-.067.11-.135.16-.207.026-.04.062-.07.086-.11.017-.03.017-.067.032-.1.03-.053.07-.1.096-.16l3.62-8.96c.417-1.03-.08-2.205-1.112-2.622-1.033-.413-2.207.083-2.624 1.115l-1.86 4.6c-1.24-4.145-1.1-8.406-1.093-8.523C9.92 18.455 21.04 7.34 34.7 7.34c13.663 0 24.78 11.116 24.78 24.78S48.357 56.9 34.694 56.9c-1.114 0-2.016.902-2.016 2.015s.9 2.02 2.012 2.02c15.89 0 28.81-12.925 28.81-28.81 0-15.89-12.923-28.814-28.81-28.814z'/>
          <path d='M33.916 36.002c.203.084.417.114.634.13.045.002.09.026.134.026.236 0 .465-.054.684-.134.06-.022.118-.054.177-.083.167-.08.32-.18.463-.3.03-.023.072-.033.103-.07L48.7 22.98c.788-.79.788-2.064 0-2.852-.787-.788-2.062-.788-2.85 0l-11.633 11.63-10.44-4.37c-1.032-.432-2.208.052-2.64 1.08-.43 1.027.056 2.208 1.08 2.638L33.907 36c.002 0 .006 0 .01.002z'/>
        </svg>

        <svg
          className='panel-MenuBar_IconShare'
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 58.999 58.999'
          onClick={shareImg}
        >
          <title>{t('tipShareImg')}</title>
          <path d='M19.48 12.02c.255 0 .51-.1.706-.294L28.5 3.413V39c0 .552.446 1 1 1s1-.448 1-1V3.412l8.27 8.272c.392.39 1.024.39 1.415 0s.39-1.023 0-1.414L30.207.294C30.115.2 30.004.127 29.88.076c-.244-.1-.52-.1-.764 0-.123.05-.234.125-.326.217l-10.018 10.02c-.39.39-.39 1.022 0 1.413.195.196.45.293.707.293z'/>
          <path d='M36.5 16c-.554 0-1 .446-1 1s.446 1 1 1h13v39h-40V18h13c.552 0 1-.448 1-1s-.448-1-1-1h-15v43h44V16h-15z'/>
        </svg>

        <svg
          className={`panel-MenuBar_IconPin ${isPinned ? 'isActive' : ''}`}
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 53.011 53.011'
          onClick={pinPanel}
        >
          <title>{t('tipPinPanel')}</title>
          <path d='M52.963 21.297c-.068-.33-.297-.603-.61-.727-8.573-3.416-16.172-.665-18.36.288L19.113 8.2C19.634 3.632 17.17.508 17.06.372c-.18-.22-.442-.356-.725-.372-.282-.006-.56.09-.76.292L.32 15.546c-.202.2-.308.48-.29.765.015.285.152.55.375.727 2.775 2.202 6.35 2.167 7.726 2.055l12.722 14.953c-.868 2.23-3.52 10.27-.307 18.337.124.313.397.54.727.61.067.013.135.02.202.02.263 0 .518-.104.707-.293l14.57-14.57 13.57 13.57c.196.194.452.292.708.292s.512-.098.707-.293c.39-.392.39-1.024 0-1.415l-13.57-13.57 14.527-14.528c.237-.238.34-.58.27-.91zm-17.65 15.458L21.89 50.18c-2.437-8.005.993-15.827 1.03-15.91.158-.352.1-.764-.15-1.058L9.31 17.39c-.19-.225-.473-.352-.764-.352-.05 0-.103.004-.154.013-.036.007-3.173.473-5.794-.954l13.5-13.5c.604 1.156 1.39 3.26.964 5.848-.058.346.07.697.338.924l15.785 13.43c.31.262.748.31 1.105.128.077-.04 7.378-3.695 15.87-1.017L35.313 36.754z'/>
        </svg>

        <svg
          className='panel-MenuBar_IconClose'
          width='30' height='30' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 31.112 31.112'
          onClick={closePanel}
        >
          <title>{t('tipClosePanel')}</title>
          <path d='M31.112 1.414L29.698 0 15.556 14.142 1.414 0 0 1.414l14.142 14.142L0 29.698l1.414 1.414L15.556 16.97l14.142 14.142 1.414-1.414L16.97 15.556'/>
        </svg>
      </header>
    )
  }
}

export default translate()(MenuBar)
