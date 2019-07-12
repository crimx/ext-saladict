import React, { FC, MouseEvent } from 'react'
import i18next from 'i18next'

export interface HistoryBackBtnProps {
  t: i18next.TFunction
  disabled?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => any
}

/**
 * History Back Button
 */
export const HistoryBackBtn: FC<HistoryBackBtnProps> = props => {
  return (
    <button
      className="panel-MenuBar_Btn-dir"
      onClick={props.onClick}
      disabled={!!props.disabled}
    >
      <svg
        className="panel-MenuBar_Icon"
        width="30"
        height="30"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.t('tip.historyBack')}</title>
        <path d="M 7.191 15.999 L 21.643 1.548 C 21.998 1.192 21.998 0.622 21.643 0.267 C 21.288 -0.089 20.718 -0.089 20.362 0.267 L 5.267 15.362 C 4.911 15.718 4.911 16.288 5.267 16.643 L 20.362 31.732 C 20.537 31.906 20.771 32 20.999 32 C 21.227 32 21.462 31.913 21.636 31.732 C 21.992 31.377 21.992 30.807 21.636 30.451 L 7.191 15.999 Z" />
      </svg>
    </button>
  )
}

export interface HistoryNextBtnProps {
  t: i18next.TFunction
  disabled?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => any
}

/**
 * History Back Button
 */
export const HistoryNextBtn: FC<HistoryNextBtnProps> = props => {
  return (
    <button
      className="panel-MenuBar_Btn-dir"
      onClick={props.onClick}
      disabled={!!props.disabled}
    >
      <svg
        className="panel-MenuBar_Icon"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
      >
        <title>{props.t('tip.historyNext')}</title>
        <path d="M 25.643 15.362 L 10.547 0.267 C 10.192 -0.089 9.622 -0.089 9.267 0.267 C 8.911 0.622 8.911 1.192 9.267 1.547 L 23.718 15.999 L 9.267 30.451 C 8.911 30.806 8.911 31.376 9.267 31.732 C 9.441 31.906 9.676 32 9.904 32 C 10.132 32 10.366 31.913 10.541 31.732 L 25.636 16.636 C 25.992 16.288 25.992 15.711 25.643 15.362 Z" />
      </svg>
    </button>
  )
}
