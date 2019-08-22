import React, { FC, useState, useEffect } from 'react'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'

export interface DictItemHeadProps {
  dictID: DictID
  isSearching: boolean
  toggleFold: () => void
  openDictSrcPage: (id: DictID) => void
}

export const DictItemHead: FC<DictItemHeadProps> = props => {
  const { t } = useTranslate('dicts')

  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    // small time offset to add a little organic feeling
    const ticket = setTimeout(
      () => setShowLoader(props.isSearching),
      Math.random() * 1500
    )
    return () => {
      clearTimeout(ticket)
    }
  }, [props.isSearching])

  return (
    <header
      className={`dictItemHead${props.isSearching ? ' isSearching' : ''}`}
      onClick={props.toggleFold}
    >
      <img
        className="dictItemHead-Logo"
        src={require('@/components/dictionaries/' +
          props.dictID +
          '/favicon.png')}
        alt="dict logo"
      />
      <h1 className="dictItemHead-Title">
        <a
          href="#"
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            e.preventDefault()
            props.openDictSrcPage(props.dictID)
          }}
        >
          {t(`${props.dictID}.name`)}
        </a>
      </h1>
      {showLoader && (
        <div className="dictItemHead-Loader">
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      )}
      <button
        className="dictItemHead-FoldArrowBtn"
        onMouseOut={e => e.currentTarget.blur()}
      >
        <svg
          className="dictItemHead-FoldArrow"
          width="18"
          height="18"
          viewBox="0 0 59.414 59.414"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="dictItemHead-FoldArrowPath"
            d="M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58"
          />
        </svg>
      </button>
    </header>
  )
}
