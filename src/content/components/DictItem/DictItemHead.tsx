import React, { FC, useState, useEffect, useMemo } from 'react'
import classnames from 'classnames'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import { HoverBox, HoverBoxItem } from '@/components/HoverBox'

export interface DictItemHeadProps {
  dictID: DictID
  isSearching: boolean
  toggleFold: () => void
  openDictSrcPage: (id: DictID, ctrlKey: boolean) => void
  onCatalogSelect: (item: { key: string; value: string }) => void
  catalog?: Array<
    | {
        // <button>
        key: string
        value: string
        label: string
        options?: undefined
      }
    | {
        // <select>
        key: string
        value: string
        options: Array<{
          value: string
          label: string
        }>
        title?: string
      }
  >
}

export const DictItemHead: FC<DictItemHeadProps> = props => {
  const { t, ready } = useTranslate(['dicts', 'content', 'langcode'])

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

  const icon = useMemo(
    () =>
      browser.runtime.getURL(
        require('@/components/dictionaries/' + props.dictID + '/favicon.png')
      ),
    [props.dictID]
  )

  const menuItems = useMemo(() => {
    const menuItems: HoverBoxItem[] = []
    const localedLabel = (text: string) =>
      text.replace(/%t\((\S+)\)/g, (m, s1) => t(s1))

    if (props.catalog) {
      for (const item of props.catalog) {
        if (item.options) {
          menuItems.push({
            key: item.key,
            value: item.value,
            title: item.title && localedLabel(item.title),
            options: item.options.map(opt => ({
              value: opt.value,
              label: localedLabel(opt.label)
            }))
          })
        } else {
          menuItems.push({
            key: item.key,
            value: item.value,
            label: localedLabel(item.label)
          })
        }
      }
    }

    menuItems.push({
      key: '_options',
      value: '_options',
      label: t('content:tip.openOptions')
    })

    return menuItems
  }, [props.catalog, ready])

  return (
    <header
      className={classnames('dictItemHead', {
        isSearching: props.isSearching
      })}
    >
      <img className="dictItemHead-Logo" src={icon} alt="dict logo" />
      <h1 className="dictItemHead-Title">
        <a
          href="#"
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            e.preventDefault()
            props.openDictSrcPage(props.dictID, e.ctrlKey)
          }}
        >
          {t(`${props.dictID}.name`)}
        </a>
      </h1>
      <HoverBox
        compact
        Button={MenusBtn}
        items={menuItems}
        top={25}
        onSelect={(key, value) => {
          if (key === '_options') {
            message.send({
              type: 'OPEN_URL',
              payload: {
                url: 'options.html?menuselected=Dictionaries',
                self: true
              }
            })
          } else {
            props.onCatalogSelect({ key, value })
          }
        }}
      />
      {showLoader && (
        <div className="dictItemHead-Loader">
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      )}
      <div className="dictItemHead-EmptyArea" onClick={props.toggleFold} />
      <button
        className="dictItemHead-FoldArrowBtn"
        onMouseOut={e => e.currentTarget.blur()}
        onClick={props.toggleFold}
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

function MenusBtn(props: React.ComponentProps<'button'>) {
  return (
    <button className="dictItemHead-Menus_Btn" {...props}>
      <svg width="16" height="16" viewBox="0 0 512 512">
        <path d="M301.256 394.29A45.256 45.256 0 01256 439.546a45.256 45.256 0 01-45.256-45.256A45.256 45.256 0 01256 349.034a45.256 45.256 0 0145.256 45.256zM301.256 257.48A45.256 45.256 0 01256 302.736a45.256 45.256 0 01-45.256-45.256A45.256 45.256 0 01256 212.224a45.256 45.256 0 0145.256 45.256zM301.256 117.71A45.256 45.256 0 01256 162.964a45.256 45.256 0 01-45.256-45.256A45.256 45.256 0 01256 72.453a45.256 45.256 0 0145.256 45.256z" />
      </svg>
    </button>
  )
}
