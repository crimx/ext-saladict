import React, { ComponentType, FC, useState, useEffect } from 'react'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { DictItemHead, DictItemHeadProps } from './DictItemHead'
import { DictItemBody, DictItemBodyProps } from './DictItemBody'
import { ResizeReporter } from 'react-resize-reporter/scroll'
import { DictID } from '@/app-config'
import { useObservableCallback, identity } from 'observable-hooks'

export interface DictItemProps
  extends Omit<DictItemBodyProps, 'catalogSelect$'> {
  /** default height when search result is received */
  preferredHeight: number
  /** Inject dict component. Mainly for testing */
  dictComp?: ComponentType<ViewPorps<any>>

  catalog?: DictItemHeadProps['catalog']
  openDictSrcPage: DictItemHeadProps['openDictSrcPage']

  onHeightChanged: (id: DictID, height: number) => void

  /** User manually folds or unfolds */
  onUserFold: (id: DictID, fold: boolean) => void
}

export const DictItem: FC<DictItemProps> = props => {
  const [onCatalogSelect, catalogSelect$] = useObservableCallback<{
    key: string
    value: string
  }>(identity)

  const [foldState, setFoldState] = useState<'COLLAPSE' | 'HALF' | 'FULL'>(
    'COLLAPSE'
  )
  /** Rendered height */
  const [offsetHeight, setOffsetHeight] = useState(10)

  const visibleHeight = Math.max(
    10,
    foldState === 'COLLAPSE'
      ? 10
      : foldState === 'FULL'
      ? offsetHeight
      : Math.min(offsetHeight, props.preferredHeight)
  )

  useEffect(() => {
    if (props.searchStatus === 'FINISH') {
      setFoldState('HALF')
    } else {
      setFoldState('COLLAPSE')
    }
  }, [props.searchStatus])

  useEffect(() => {
    props.onHeightChanged(props.dictID, visibleHeight + 21)
  }, [visibleHeight])

  return (
    <section
      className={`dictItem${foldState === 'COLLAPSE' ? '' : ' isUnfold'}`}
    >
      <DictItemHead
        dictID={props.dictID}
        catalog={props.catalog}
        isSearching={props.searchStatus === 'SEARCHING'}
        toggleFold={toggleFold}
        openDictSrcPage={props.openDictSrcPage}
        onCatalogSelect={onCatalogSelect}
      />
      <div
        className="dictItem-Body"
        key={props.dictID}
        style={{ height: visibleHeight }}
        onClick={searchLinkText}
      >
        <article className="dictItem-BodyMesure">
          <ResizeReporter reportInit onHeightChanged={setOffsetHeight} />
          {props.dictComp ? (
            props.searchStatus === 'FINISH' &&
            props.searchResult &&
            React.createElement(props.dictComp, {
              result: props.searchResult,
              searchText: props.searchText,
              catalogSelect$: catalogSelect$
            })
          ) : (
            <DictItemBody {...props} catalogSelect$={catalogSelect$} />
          )}
        </article>
        {foldState === 'HALF' &&
          visibleHeight < offsetHeight &&
          props.searchResult && (
            <button
              className="dictItem-FoldMask"
              onClick={() => setFoldState('FULL')}
            >
              <svg
                className="dictItem-FoldMaskArrow"
                width="15"
                height="15"
                viewBox="0 0 59.414 59.414"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56" />
              </svg>
            </button>
          )}
      </div>
    </section>
  )

  /** Search the content of an <a> instead of jumping unless it's external */
  function searchLinkText(e: React.MouseEvent<HTMLElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      // ignore if extra key is pressed
      return
    }

    if (!(e.target as HTMLElement).tagName) {
      return
    }

    const $dictItemRoot = e.currentTarget
    for (
      let el: HTMLElement | null = e.target as HTMLElement;
      el && el !== $dictItemRoot;
      el = el.parentElement
    ) {
      if (el.tagName === 'A' || el.getAttribute('role') === 'link') {
        e.preventDefault()
        e.stopPropagation()

        const $a = el as HTMLAnchorElement
        if (/nofollow|noopener|noreferrer/.test($a.rel)) {
          message.send({
            type: 'OPEN_URL',
            payload: {
              url: $a.href
            }
          })
        } else {
          props.searchText({
            word: newWord({
              text: $a.textContent || '',
              title: 'Saladict',
              favicon: 'https://saladict.crimx.com/favicon.ico'
            })
          })
        }

        return
      }
    }
  }

  function toggleFold() {
    if (props.searchStatus === 'SEARCHING') {
      return
    }

    if (foldState !== 'COLLAPSE') {
      setFoldState('COLLAPSE')
      props.onUserFold(props.dictID, true)
      return
    }

    props.onUserFold(props.dictID, false)

    if (props.searchResult) {
      setFoldState('HALF')
    } else {
      props.searchText({ id: props.dictID })
    }
  }
}
