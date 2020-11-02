import React, { FC } from 'react'
import {
  useObservableCallback,
  useObservable,
  useSubscription
} from 'observable-hooks'
import { Observable, combineLatest } from 'rxjs'
import { startWith, debounceTime, map } from 'rxjs/operators'
import { Word } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import {
  isStandalonePage,
  isOptionsPage,
  isPopupPage,
  isQuickSearchPage
} from '@/_helpers/saladict'
import {
  HistoryBackBtn,
  HistoryNextBtn,
  FavBtn,
  HistoryBtn,
  NotebookBtn,
  PinBtn,
  CloseBtn,
  SidebarBtn,
  FocusBtn
} from './MenubarBtns'
import { SearchBox, SearchBoxProps } from './SearchBox'
import { Profiles, ProfilesProps } from './Profiles'

export interface MenuBarProps {
  text: string
  updateText: SearchBoxProps['onInput']
  searchText: (text: string) => any

  /** is in Notebook */
  isInNotebook: boolean
  addToNoteBook: () => any

  shouldFocus: boolean
  enableSuggest: boolean

  isTrackHistory: boolean
  histories: Word[]
  historyIndex: number
  switchHistory: (direction: 'prev' | 'next') => void

  onSelectProfile: (id: string) => void
  profiles: ProfilesProps['profiles']
  activeProfileId: ProfilesProps['activeProfileId']

  isPinned: boolean
  togglePin: () => any

  isQSFocus: boolean
  toggleQSFocus: () => any

  onClose: () => any
  onSwitchSidebar: (side: 'left' | 'right') => any

  onHeightChanged: (height: number) => void

  onDragAreaMouseDown: (e: React.MouseEvent<HTMLDivElement>) => any
  onDragAreaTouchStart: (e: React.TouchEvent<HTMLDivElement>) => any
}

export const MenuBar: FC<MenuBarProps> = props => {
  const { t } = useTranslate(['content', 'common'])

  const [updateProfileHeight, profileHeight$] = useObservableCallback<number>(
    heightChangeTransform
  )

  const [updateSBHeight, searchBoxHeight$] = useObservableCallback<number>(
    heightChangeTransform
  )

  // update panel min height
  useSubscription(
    useObservable(() =>
      combineLatest(profileHeight$, searchBoxHeight$).pipe(
        // a little delay for organic feeling
        debounceTime(100),
        map(heights => {
          const max = Math.max(...heights)
          return max > 0 ? max + 72 : 0
        })
      )
    ),
    props.onHeightChanged
  )

  return (
    <header className="menuBar">
      <HistoryBackBtn
        t={t}
        disabled={props.historyIndex <= 0}
        onClick={() => props.switchHistory('prev')}
      />
      <HistoryNextBtn
        t={t}
        disabled={props.historyIndex >= props.histories.length - 1}
        onClick={() => props.switchHistory('next')}
      />
      <SearchBox
        key="searchbox"
        t={t}
        text={props.text}
        shouldFocus={props.shouldFocus}
        enableSuggest={props.enableSuggest}
        onInput={props.updateText}
        onSearch={props.searchText}
        onHeightChanged={updateSBHeight}
      />
      {isStandalonePage() || (
        <div
          className="menuBar-DragArea"
          onMouseDown={props.onDragAreaMouseDown}
          onTouchStart={props.onDragAreaTouchStart}
        />
      )}
      <Profiles
        t={t}
        profiles={props.profiles}
        activeProfileId={props.activeProfileId}
        onSelectProfile={props.onSelectProfile}
        onHeightChanged={updateProfileHeight}
      />
      <FavBtn
        t={t}
        isFav={props.isInNotebook}
        onClick={props.addToNoteBook}
        onMouseDown={e => {
          if (e.button === 2) {
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.blur()
            message.send({
              type: 'OPEN_URL',
              payload: {
                url: 'notebook.html',
                self: true
              }
            })
          }
        }}
      />
      {props.isTrackHistory ? (
        <HistoryBtn
          t={t}
          onClick={() =>
            message.send({
              type: 'OPEN_URL',
              payload: { url: 'history.html', self: true }
            })
          }
        />
      ) : (
        <NotebookBtn
          t={t}
          onClick={() =>
            message.send({
              type: 'OPEN_URL',
              payload: { url: 'notebook.html', self: true }
            })
          }
        />
      )}

      {isQuickSearchPage() ? (
        <>
          <FocusBtn
            t={t}
            isFocus={props.isQSFocus}
            onClick={props.toggleQSFocus}
            disabled={isOptionsPage() || isPopupPage()}
          />
          <SidebarBtn
            t={t}
            onMouseDown={e => {
              e.preventDefault()
              props.onSwitchSidebar(e.button === 0 ? 'left' : 'right')
            }}
          />
        </>
      ) : isPopupPage() ? null : (
        <>
          <PinBtn
            t={t}
            isPinned={props.isPinned}
            onClick={props.togglePin}
            disabled={isOptionsPage() || isPopupPage()}
          />
          <CloseBtn t={t} onClick={props.onClose} />
        </>
      )}
    </header>
  )
}

function heightChangeTransform(
  height$: Observable<number>
): Observable<number> {
  return startWith<number>(0)(height$)
}
