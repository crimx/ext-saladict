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
  isPopupPage
} from '@/_helpers/saladict'
import {
  HistoryBackBtn,
  HistoryNextBtn,
  FavBtn,
  HistoryBtn,
  PinBtn,
  CloseBtn
} from './MenubarBtns'
import { SearchBox, SearchBoxProps } from './SearchBox'
import { Profiles, ProfilesProps } from './Profiles'

const ProfilesMemo = React.memo(Profiles)

export interface MenuBarProps {
  text: string
  updateText: SearchBoxProps['onInput']
  searchText: (text: string) => any

  /** is in Notebook */
  isInNotebook: boolean
  addToNoteBook: () => any

  shouldFocus: boolean
  enableSuggest: boolean

  histories: Word[]
  historyIndex: number
  updateHistoryIndex: (index: number) => any

  profiles: ProfilesProps['profiles']
  activeProfileId: ProfilesProps['activeProfileId']

  isPinned: boolean
  togglePin: () => any

  onClose: () => any

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
        onClick={() => props.updateHistoryIndex(props.historyIndex - 1)}
      />
      <HistoryNextBtn
        t={t}
        disabled={props.historyIndex >= props.histories.length - 1}
        onClick={() => props.updateHistoryIndex(props.historyIndex + 1)}
      />
      <SearchBox
        t={t}
        text={props.text}
        shouldFocus={props.shouldFocus}
        enableSuggest={props.enableSuggest}
        onInput={props.updateText}
        onSearch={props.searchText}
        onHeightChanged={updateSBHeight}
      />
      <div
        className={`menuBar-DragArea${isStandalonePage() ? '' : ' isActive'}`}
        onMouseDown={props.onDragAreaMouseDown}
        onTouchStart={props.onDragAreaTouchStart}
      />
      <ProfilesMemo
        t={t}
        profiles={props.profiles}
        activeProfileId={props.activeProfileId}
        onHeightChanged={updateProfileHeight}
        onProfileChanged={() => {
          setTimeout(() => {
            props.searchText(props.text)
          }, 500)
        }}
      />
      <FavBtn t={t} isFav={props.isInNotebook} onClick={props.addToNoteBook} />
      <HistoryBtn
        t={t}
        onClick={() =>
          message.send({
            type: 'OPEN_URL',
            payload: { url: 'history.html', self: true }
          })
        }
      />
      <PinBtn
        t={t}
        isPinned={props.isPinned}
        onClick={props.togglePin}
        disabled={isOptionsPage() || isPopupPage()}
      />
      <CloseBtn t={t} onClick={props.onClose} />
    </header>
  )
}

function heightChangeTransform(
  height$: Observable<number>
): Observable<number> {
  return startWith<number>(0)(height$)
}
