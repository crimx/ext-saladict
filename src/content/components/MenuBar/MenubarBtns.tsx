import React, { FC } from 'react'
import { TFunction } from 'i18next'

export interface MenubarBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  t: TFunction
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

export interface FocusBtnProps extends MenubarBtnProps {
  /** Dict panel focus */
  isFocus: boolean
}

/**
 * Focus standalone panel when searching
 */
export const FocusBtn: FC<FocusBtnProps> = props => {
  const { t, isFocus, ...restProps } = props
  return (
    <button
      className="menuBar-Btn"
      title={t(`tip.${isFocus ? 'focusPanel' : 'unfocusPanel'}`)}
      {...restProps}
    >
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 53 53"
      >
        {isFocus ? (
          <>
            <path d="M 36.414 35 L 46 35 C 46.553 35 47 34.552 47 34 C 47 33.448 46.553 33 46 33 L 34 33 C 33.87 33 33.74 33.027 33.618 33.077 C 33.374 33.178 33.179 33.373 33.077 33.618 C 33.026 33.74 33 33.869 33 34 L 33 46 C 33 46.552 33.448 47 34 47 C 34.552 47 35 46.552 35 46 L 35 36.414 L 51.293 52.707 C 51.488 52.902 51.744 53 52 53 C 52.256 53 52.512 52.902 52.707 52.707 C 53.098 52.316 53.098 51.684 52.707 51.293 L 36.414 35 Z" />
            <path d="M 16.584 17.999 L 6.999 17.999 C 6.447 17.999 5.999 18.447 5.999 18.999 C 5.999 19.551 6.447 19.999 6.999 19.999 L 18.999 19.999 C 19.129 19.999 19.259 19.972 19.381 19.922 C 19.625 19.821 19.82 19.626 19.922 19.381 C 19.973 19.259 19.999 19.129 19.999 18.999 L 19.999 6.999 C 19.999 6.447 19.551 5.999 18.999 5.999 C 18.447 5.999 17.999 6.447 17.999 6.999 L 17.999 16.585 L 1.707 0.293 C 1.316 -0.098 0.684 -0.098 0.293 0.293 C -0.098 0.684 -0.098 1.316 0.293 1.707 L 16.584 17.999 Z" />
            <path d="M 19.382 33.077 C 19.26 33.027 19.13 33 19 33 L 7 33 C 6.448 33 6 33.448 6 34 C 6 34.552 6.448 35 7 35 L 16.586 35 L 0.293 51.293 C -0.098 51.684 -0.098 52.316 0.293 52.707 C 0.488 52.902 0.744 53 1 53 C 1.256 53 1.512 52.902 1.707 52.707 L 18 36.414 L 18 46 C 18 46.552 18.448 47 19 47 C 19.552 47 20 46.552 20 46 L 20 34 C 20 33.87 19.973 33.74 19.923 33.618 C 19.821 33.373 19.627 33.179 19.382 33.077 Z" />
            <path d="M 33.618 19.923 C 33.74 19.973 33.87 20 34 20 L 46 20 C 46.553 20 47 19.552 47 19 C 47 18.448 46.553 18 46 18 L 36.414 18 L 52.707 1.707 C 53.098 1.316 53.098 0.684 52.707 0.293 C 52.316 -0.098 51.684 -0.098 51.293 0.293 L 35 16.586 L 35 7 C 35 6.448 34.552 6 34 6 C 33.448 6 33 6.448 33 7 L 33 19 C 33 19.13 33.027 19.26 33.077 19.382 C 33.179 19.627 33.373 19.821 33.618 19.923 Z" />
            <path d="M 26.5 19 C 22.364 19 19 22.364 19 26.5 C 19 30.636 22.364 34 26.5 34 C 30.636 34 34 30.636 34 26.5 C 34 22.364 30.636 19 26.5 19 Z M 26.5 32 C 23.467 32 21 29.533 21 26.5 C 21 23.467 23.467 21 26.5 21 C 29.533 21 32 23.467 32 26.5 C 32 29.533 29.533 32 26.5 32 Z" />
          </>
        ) : (
          <>
            <path d="M 34 20 C 33.744 20 33.488 19.902 33.293 19.707 C 32.902 19.316 32.902 18.684 33.293 18.293 L 49.586 2 L 40 2 C 39.448 2 39 1.552 39 1 C 39 0.448 39.448 0 40 0 L 51.978 0 C 52.241 -0.006 52.506 0.092 52.707 0.293 C 52.908 0.494 53.006 0.759 53 1.022 L 53 13 C 53 13.552 52.552 14 52 14 C 51.448 14 51 13.552 51 13 L 51 3.414 L 34.707 19.707 C 34.512 19.902 34.256 20 34 20 Z" />
            <path d="M 0.293 52.707 C 0.092 52.506 -0.006 52.241 0 51.978 L 0 40 C 0 39.448 0.448 39 1 39 C 1.552 39 2 39.448 2 40 L 2 49.586 L 18.293 33.293 C 18.684 32.902 19.316 32.902 19.707 33.293 C 20.098 33.684 20.098 34.316 19.707 34.707 L 3.414 51 L 13 51 C 13.552 51 14 51.448 14 52 C 14 52.552 13.552 53 13 53 L 1 53 C 0.879 53 0.764 52.979 0.658 52.94 C 0.602 52.919 0.548 52.894 0.498 52.865 C 0.424 52.822 0.355 52.769 0.293 52.707 Z" />
            <path d="M 33.293 34.707 C 32.902 34.316 32.902 33.684 33.293 33.293 C 33.684 32.902 34.316 32.902 34.707 33.293 L 51 49.586 L 51 40 C 51 39.448 51.448 39 52 39 C 52.552 39 53 39.448 53 40 L 53 51.978 C 53.006 52.241 52.908 52.506 52.707 52.707 C 52.645 52.769 52.576 52.822 52.502 52.865 C 52.452 52.894 52.398 52.919 52.342 52.94 C 52.236 52.979 52.121 53 52 53 L 40 53 C 39.448 53 39 52.552 39 52 C 39 51.448 39.448 51 40 51 L 49.586 51 Z" />
            <path d="M 18.999 19.999 C 18.743 19.999 18.487 19.901 18.292 19.706 L 2 3.414 L 2 13 C 2 13.552 1.552 14 1 14 C 0.448 14 0 13.552 0 13 L 0 1.022 C -0.006 0.759 0.092 0.494 0.293 0.293 C 0.494 0.092 0.759 -0.006 1.022 0 L 13 0 C 13.552 0 14 0.448 14 1 C 14 1.552 13.552 2 13 2 L 3.414 2 L 19.706 18.292 C 20.097 18.683 20.097 19.315 19.706 19.706 C 19.51 19.901 19.254 19.999 18.999 19.999 Z" />
          </>
        )}
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

export const SidebarBtn: FC<MenubarBtnProps> = props => {
  const { t, ...restProps } = props
  return (
    <button className="menuBar-Btn" title={t('tip.sidebar')} {...restProps}>
      <svg
        className="menuBar-Btn_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 30 30"
      >
        <path d="M 29.318 0 L 0.682 0 C 0.305 0 0 0.305 0 0.682 L 0 29.318 C 0 29.695 0.305 30 0.682 30 L 29.318 30 C 29.695 30 30 29.695 30 29.318 L 30 0.682 C 30 0.305 29.695 0 29.318 0 Z M 9.545 28.636 L 1.364 28.636 L 1.364 1.364 L 9.545 1.364 L 9.545 28.636 Z M 28.636 28.636 L 10.909 28.636 L 10.909 1.364 L 28.636 1.364 L 28.636 28.636 Z" />
      </svg>
    </button>
  )
}
