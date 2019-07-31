import React, {
  ComponentType,
  FC,
  useState,
  useRef,
  useCallback,
  useEffect
} from 'react'
import root from 'react-shadow'
import { message } from '@/_helpers/browser-api'
import { Word, newWord } from '@/_helpers/record-manager'
import { DictID } from '@/app-config'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DictItemHead } from './DictItemHead'

export interface DictItem {
  dictID: DictID
  text: string
  fontSize: number
  /** default height when search result is received */
  preferredHeight: number

  searchStatus: 'IDLE' | 'SEARCHING' | 'FINISH'
  searchResult?: object | null

  /** Inject dict component. Mainly for testing */
  dictComp?: ComponentType<ViewPorps<any>>

  searchText: (arg?: {
    id?: DictID
    word?: Word
    payload?: { [index: string]: any }
  }) => any
}

export const DictItem: FC<DictItem> = props => {
  const [foldState, setFoldState] = useState<'COLLAPSE' | 'HALF' | 'FULL'>(
    'COLLAPSE'
  )
  /** Rendered height */
  const [visibleHeight, setVisibleHeight] = useState(10)

  const bodyRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (props.searchStatus === 'FINISH') {
      // wait till render complete
      setTimeout(unfold, 0)
    } else {
      fold()
    }
  }, [props.searchStatus, props.searchResult])

  const recalcBodyHeight = useCallback(
    () =>
      setTimeout(() => {
        if (bodyRef.current) {
          setVisibleHeight(Math.max(bodyRef.current.offsetHeight || 10, 10))
        }
      }, 0),
    [bodyRef.current]
  )

  return (
    <section
      className={`dictItem${foldState === 'COLLAPSE' ? '' : ' isUnfold'}`}
    >
      <DictItemHead
        dictID={props.dictID}
        text={props.text}
        isSearching={props.searchStatus === 'SEARCHING'}
        toggleFold={toggleFold}
      />
      <div
        className="dictItem-Body"
        key={props.dictID}
        style={{ fontSize: props.fontSize, height: visibleHeight }}
      >
        <article
          ref={bodyRef}
          className="dictItem-BodyMesure"
          onClick={searchLinkText}
        >
          <ErrorBoundary error={DictRenderError}>
            {props.searchStatus === 'FINISH' &&
              props.searchResult &&
              (props.dictComp ? (
                React.createElement(props.dictComp, {
                  result: props.searchResult,
                  searchText: props.searchText,
                  recalcBodyHeight
                })
              ) : (
                <root.div>
                  <style>
                    {require('@/components/dictionaries/' +
                      props.dictID +
                      '/_style.shadow.scss').toString()}
                  </style>
                  {React.createElement<ViewPorps<any>>(
                    require('@/components/dictionaries/' +
                      props.dictID +
                      '/View.tsx').View,
                    {
                      result: props.searchResult,
                      searchText: props.searchText,
                      recalcBodyHeight
                    }
                  )}
                </root.div>
              ))}
          </ErrorBoundary>
        </article>
        {foldState === 'HALF' && props.searchResult && (
          <button
            className="dictItem-FoldMask"
            onClick={() => {
              if (bodyRef.current) {
                setFoldState('FULL')
                setVisibleHeight(
                  Math.max(bodyRef.current.offsetHeight || 10, 10)
                )
              }
            }}
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

  function fold() {
    setFoldState('COLLAPSE')
    setVisibleHeight(10)
  }

  function unfold() {
    const offsetHeight = Math.max(bodyRef.current!.offsetHeight || 10, 10)
    if (offsetHeight <= props.preferredHeight) {
      setVisibleHeight(offsetHeight)
      setFoldState('FULL')
    } else {
      setVisibleHeight(props.preferredHeight)
      setFoldState('HALF')
    }
  }

  function toggleFold() {
    if (props.searchStatus === 'SEARCHING') {
      return
    }

    if (foldState !== 'COLLAPSE') {
      fold()
    } else if (props.searchResult) {
      unfold()
    } else {
      props.searchText({ id: props.dictID })
    }
  }
}

function DictRenderError() {
  return (
    <p style={{ textAlign: 'center' }}>
      Render error. Please{' '}
      <a
        href="https://github.com/crimx/ext-saladict/issues"
        target="_blank"
        rel="nofollow onopener noreferrer"
      >
        report issue
      </a>
      .
    </p>
  )
}
