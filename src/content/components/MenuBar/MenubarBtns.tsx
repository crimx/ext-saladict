import React, { FC } from 'react'
import i18next from 'i18next'

export interface MenubarBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  t: i18next.TFunction
}

/**
 * History Back Button
 */
export const HistoryBackBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button
      className="menuBar-Btn-dir"
      title={t('tip.historyBack')}
      {...restProps}
    >
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 7.191 15.999 L 21.643 1.548 C 21.998 1.192 21.998 0.622 21.643 0.267 C 21.288 -0.089 20.718 -0.089 20.362 0.267 L 5.267 15.362 C 4.911 15.718 4.911 16.288 5.267 16.643 L 20.362 31.732 C 20.537 31.906 20.771 32 20.999 32 C 21.227 32 21.462 31.913 21.636 31.732 C 21.992 31.377 21.992 30.807 21.636 30.451 L 7.191 15.999 Z" />
      </svg>
    </button>
  )
}

/**
 * History Back Button
 */
export const HistoryNextBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button
      className="menuBar-Btn-dir"
      title={props.t('tip.historyNext')}
      {...restProps}
    >
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
      >
        <path d="M 25.643 15.362 L 10.547 0.267 C 10.192 -0.089 9.622 -0.089 9.267 0.267 C 8.911 0.622 8.911 1.192 9.267 1.547 L 23.718 15.999 L 9.267 30.451 C 8.911 30.806 8.911 31.376 9.267 31.732 C 9.441 31.906 9.676 32 9.904 32 C 10.132 32 10.366 31.913 10.541 31.732 L 25.636 16.636 C 25.992 16.288 25.992 15.711 25.643 15.362 Z" />
      </svg>
    </button>
  )
}

/**
 * Search Button
 */
export const SearchBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.searchText')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52.966 52.966"
      >
        <path d="M51.704 51.273L36.844 35.82c3.79-3.8 6.14-9.04 6.14-14.82 0-11.58-9.42-21-21-21s-21 9.42-21 21 9.42 21 21 21c5.082 0 9.747-1.817 13.383-4.832l14.895 15.49c.196.206.458.308.72.308.25 0 .5-.093.694-.28.398-.382.41-1.015.028-1.413zM21.984 40c-10.478 0-19-8.523-19-19s8.522-19 19-19 19 8.523 19 19-8.525 19-19 19z" />
      </svg>
    </button>
  )
}

/**
 * Options Button
 */
export const OptionsBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.openOptions')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 612 612"
      >
        <path d="M0 97.92v24.48h612V97.92H0zm0 220.32h612v-24.48H0v24.48zm0 195.84h612V489.6H0v24.48z" />
      </svg>
    </button>
  )
}

export interface FavBtnProps extends MenubarBtnProps {
  /** Current text is in Notebook */
  isFav: boolean
}

/**
 * Add to Notebook
 */
export const FavBtn: FC<FavBtnProps> = props => {
  const { t, isFav, ...restProps } = props
  return (
    <button
      className="menuBar-Btn"
      title={t('tip.addToNotebook')}
      {...restProps}
    >
      <svg
        className={`menuBar-Btn_Icon-fav${isFav ? ' isActive' : ''}`}
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
      >
        <path d="M 23.363 2 C 20.105 2 17.3 4.65 16.001 7.42 C 14.701 4.65 11.896 2 8.637 2 C 4.145 2 0.5 5.646 0.5 10.138 C 0.5 19.278 9.719 21.673 16.001 30.708 C 21.939 21.729 31.5 18.986 31.5 10.138 C 31.5 5.646 27.855 2 23.363 2 Z" />
      </svg>
    </button>
  )
}

/**
 * Open History page
 */
export const HistoryBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.openHistory')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon-history"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
      >
        <path d="M34.688 3.315c-15.887 0-28.812 12.924-28.81 28.73-.012.25-.157 4.434 1.034 8.94l-3.88-2.262c-.965-.56-2.193-.235-2.76.727-.557.96-.233 2.195.728 2.755l9.095 5.302c.02.01.038.013.056.022.1.05.2.09.31.12.07.02.14.05.21.07.09.02.176.02.265.03.06.003.124.022.186.022.036 0 .07-.01.105-.015.034 0 .063.007.097.004.05-.003.097-.024.146-.032.097-.017.19-.038.28-.068.08-.028.157-.06.23-.095.086-.04.165-.085.24-.137.074-.046.14-.096.206-.15.07-.06.135-.125.198-.195.06-.067.11-.135.16-.207.026-.04.062-.07.086-.11.017-.03.017-.067.032-.1.03-.053.07-.1.096-.16l3.62-8.96c.417-1.03-.08-2.205-1.112-2.622-1.033-.413-2.207.083-2.624 1.115l-1.86 4.6c-1.24-4.145-1.1-8.406-1.093-8.523C9.92 18.455 21.04 7.34 34.7 7.34c13.663 0 24.78 11.116 24.78 24.78S48.357 56.9 34.694 56.9c-1.114 0-2.016.902-2.016 2.015s.9 2.02 2.012 2.02c15.89 0 28.81-12.925 28.81-28.81 0-15.89-12.923-28.814-28.81-28.814z" />
        <path d="M33.916 36.002c.203.084.417.114.634.13.045.002.09.026.134.026.236 0 .465-.054.684-.134.06-.022.118-.054.177-.083.167-.08.32-.18.463-.3.03-.023.072-.033.103-.07L48.7 22.98c.788-.79.788-2.064 0-2.852-.787-.788-2.062-.788-2.85 0l-11.633 11.63-10.44-4.37c-1.032-.432-2.208.052-2.64 1.08-.43 1.027.056 2.208 1.08 2.638L33.907 36c.002 0 .006 0 .01.002z" />
      </svg>
    </button>
  )
}

export interface PinBtnProps extends MenubarBtnProps {
  /** Dict panel is pinned */
  isPinned: boolean
}

/**
 * Pin the dict panel.
 *
 * - Normal in-page dict panel will stay visible.
 * - Standalone dict panel will stay on top of other windows.
 */
export const PinBtn: FC<PinBtnProps> = props => {
  const { t, isPinned, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.pinPanel')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 53.011 53.011"
      >
        <path
          className={`menuBar-Btn_Icon-pin${isPinned ? ' isActive' : ''}`}
          d="M52.963 21.297c-.068-.33-.297-.603-.61-.727-8.573-3.416-16.172-.665-18.36.288L19.113 8.2C19.634 3.632 17.17.508 17.06.372c-.18-.22-.442-.356-.725-.372-.282-.006-.56.09-.76.292L.32 15.546c-.202.2-.308.48-.29.765.015.285.152.55.375.727 2.775 2.202 6.35 2.167 7.726 2.055l12.722 14.953c-.868 2.23-3.52 10.27-.307 18.337.124.313.397.54.727.61.067.013.135.02.202.02.263 0 .518-.104.707-.293l14.57-14.57 13.57 13.57c.196.194.452.292.708.292s.512-.098.707-.293c.39-.392.39-1.024 0-1.415l-13.57-13.57 14.527-14.528c.237-.238.34-.58.27-.91zm-17.65 15.458L21.89 50.18c-2.437-8.005.993-15.827 1.03-15.91.158-.352.1-.764-.15-1.058L9.31 17.39c-.19-.225-.473-.352-.764-.352-.05 0-.103.004-.154.013-.036.007-3.173.473-5.794-.954l13.5-13.5c.604 1.156 1.39 3.26.964 5.848-.058.346.07.697.338.924l15.785 13.43c.31.262.748.31 1.105.128.077-.04 7.378-3.695 15.87-1.017L35.313 36.754z"
        />
      </svg>
    </button>
  )
}

/**
 * Close dict panel
 */
export const CloseBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.closePanel')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 31.112 31.112"
      >
        <path d="M31.112 1.414L29.698 0 15.556 14.142 1.414 0 0 1.414l14.142 14.142L0 29.698l1.414 1.414L15.556 16.97l14.142 14.142 1.414-1.414L16.97 15.556" />
      </svg>
    </button>
  )
}
