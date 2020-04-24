import React, { ComponentType, FC, useMemo, Suspense } from 'react'
import root from 'react-shadow'
import { DictID } from '@/app-config'
import { Word } from '@/_helpers/record-manager'
import { SALADICT_PANEL } from '@/_helpers/saladict'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { StaticSpeakerContainer } from '@/components/Speaker'

const dictContentStyles = require('./DictItemContent.shadow.scss').toString()

export interface DictItemBodyProps {
  dictID: DictID

  fontSize: number
  withAnimation: boolean

  panelCSS: string

  searchStatus: 'IDLE' | 'SEARCHING' | 'FINISH'
  searchResult?: object | null

  searchText: (arg?: {
    id?: DictID
    word?: Word
    payload?: { [index: string]: any }
  }) => any

  onSpeakerPlay: (src: string) => Promise<void>

  onInPanelSelect: (e: React.MouseEvent<HTMLElement>) => void
}

export const DictItemBody: FC<DictItemBodyProps> = props => {
  const Dict = useMemo(
    () =>
      React.lazy<ComponentType<ViewPorps<any>>>(() =>
        import(
          /* webpackInclude: /View\.tsx$/ */
          /* webpackMode: "lazy" */
          `@/components/dictionaries/${props.dictID}/View.tsx`
        )
      ),
    [props.dictID]
  )

  const DictStyle = useMemo(
    () =>
      React.lazy(async () => {
        const styleModule = await import(
          /* webpackInclude: /_style\.shadow\.scss$/ */
          /* webpackMode: "lazy" */
          `@/components/dictionaries/${props.dictID}/_style.shadow.scss`
        )
        return {
          default: () => (
            <style>{(styleModule.default || styleModule).toString()}</style>
          )
        }
      }),
    [props.dictID]
  )

  return (
    <ErrorBoundary error={DictRenderError}>
      <Suspense fallback={null}>
        {props.searchStatus === 'FINISH' && props.searchResult && (
          <root.div>
            <style>{dictContentStyles}</style>
            <DictStyle />
            <style>
              {`.dictRoot {
                  font-size: ${props.fontSize}px;
                  -webkit-font-smoothing: antialiased;
                  text-rendering: optimizelegibility;
                  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
                }`}
            </style>
            {props.panelCSS ? <style>{props.panelCSS}</style> : null}
            <StaticSpeakerContainer
              className={
                `d-${props.dictID} dictRoot ${SALADICT_PANEL}` +
                (props.withAnimation ? ' isAnimate' : '')
              }
              onPlayStart={props.onSpeakerPlay}
              onMouseUp={props.onInPanelSelect}
            >
              <Dict result={props.searchResult} searchText={props.searchText} />
            </StaticSpeakerContainer>
          </root.div>
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

function DictRenderError() {
  return (
    <p style={{ textAlign: 'center' }}>
      Render error. Please{' '}
      <a
        href="https://github.com/crimx/ext-saladict/issues"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        report issue
      </a>
      .
    </p>
  )
}
