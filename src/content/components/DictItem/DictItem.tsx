import React, {
  ComponentType,
  FC,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react'
import { useObservableCallback, identity } from 'observable-hooks'
import classnames from 'classnames'
import { ResizeReporter } from 'react-resize-reporter/scroll'
import { DictID } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { timer } from '@/_helpers/promise-more'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { DictItemHead, DictItemHeadProps } from './DictItemHead'
import { DictItemBody, DictItemBodyProps } from './DictItemBody'

const DICT_ITEM_HEAD_HEIGHT = 20

export interface DictItemProps
  extends Omit<DictItemBodyProps, 'catalogSelect$' | 'dictRootRef'> {
  /** default height when search result is received */
  preferredHeight: number
  withAnimation: boolean
  /** Inject dict component. Mainly for testing */
  TestComp?: ComponentType<ViewPorps<any>>

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

  /** Expand/collapse transition */
  const [noHeightTransition, setNoHeightTransition] = useState(false)

  const [foldState, setFoldState] = useState<'COLLAPSE' | 'HALF' | 'FULL'>(
    'COLLAPSE'
  )
  /** Rendered height */
  const [offsetHeight, setOffsetHeight] = useState(10)

  const visibleHeight = useMemo(
    () =>
      Math.max(
        10,
        foldState === 'COLLAPSE'
          ? 10
          : foldState === 'FULL'
          ? offsetHeight
          : Math.min(offsetHeight, props.preferredHeight)
      ),
    [foldState, offsetHeight, props.preferredHeight]
  )

  useEffect(() => {
    if (props.searchStatus === 'FINISH') {
      setFoldState('HALF')
    } else {
      setFoldState('COLLAPSE')
    }
  }, [props.searchStatus])

  useEffect(() => {
    props.onHeightChanged(props.dictID, visibleHeight + DICT_ITEM_HEAD_HEIGHT)
  }, [visibleHeight])

  const dictItemRef = useRef<HTMLDivElement | null>(null)
  // container element in shadow dom
  const dictRootRef = useRef<HTMLDivElement | null>(null)

  const preCatalogSelect = useCallback(
    async (item: { key: string; value: string }) => {
      if (item.key[0] !== '#') return onCatalogSelect(item)

      // handle anchor jump
      if (!dictRootRef.current) return

      const anchor = dictRootRef.current.querySelector<HTMLElement>(
        `#${item.value}`
      )
      if (!anchor) return

      if (foldState !== 'FULL') {
        setNoHeightTransition(true)
        setFoldState('FULL')
        await timer(0)
        setNoHeightTransition(false)
      }

      if (dictItemRef.current) {
        const rootNode = dictItemRef.current.getRootNode() as HTMLDivElement
        if (rootNode.querySelector) {
          const scrollParent = rootNode.querySelector('.dictPanel-Body')
          if (scrollParent) {
            scrollParent.scrollTo({
              top:
                anchor.getBoundingClientRect().y -
                scrollParent.firstElementChild!.getBoundingClientRect().y -
                30, // plus the sticky title bar
              behavior: props.withAnimation ? 'smooth' : 'auto'
            })
            return
          }
        }
      }

      // Fallback to scrollIntoView
      // The topmost area may scroll beyond dict header due to sticky layout
      anchor.scrollIntoView({
        behavior: props.withAnimation ? 'smooth' : 'auto'
      })
    },
    [foldState, props.withAnimation]
  )

  return (
    <section
      ref={dictItemRef}
      className={classnames('dictItem', {
        isUnfold: foldState !== 'COLLAPSE',
        noHeightTransition
      })}
    >
      <DictItemHead
        dictID={props.dictID}
        catalog={props.catalog}
        isSearching={props.searchStatus === 'SEARCHING'}
        toggleFold={toggleFold}
        openDictSrcPage={props.openDictSrcPage}
        onCatalogSelect={preCatalogSelect}
      />
      <div
        className="dictItem-Body"
        key={props.dictID}
        style={{ height: visibleHeight }}
        onClick={searchLinkText}
      >
        <article className="dictItem-BodyMesure">
          <ResizeReporter reportInit onHeightChanged={setOffsetHeight} />
          {props.TestComp ? (
            props.searchStatus === 'FINISH' &&
            props.searchResult &&
            React.createElement(props.TestComp, {
              result: props.searchResult,
              searchText: props.searchText,
              catalogSelect$: catalogSelect$
            })
          ) : (
            <DictItemBody
              {...props}
              catalogSelect$={catalogSelect$}
              dictRootRef={dictRootRef}
            />
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
