import React, { FC } from 'react'
import { Word } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'
import {
  HistoryBackBtn,
  HistoryNextBtn,
  SearchBtn,
  FavBtn,
  HistoryBtn,
  PinBtn,
  CloseBtn
} from './MenubarBtns'
import { SearchBox, SearchBoxProps } from './SearchBox'
import { Profiles, ProfilesProps } from './Profiles'
import { message } from '@/_helpers/browser-api'

const ProfilesMemo = React.memo(Profiles)

const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictQuickSearchPage = !!window.__SALADICT_QUICK_SEARCH_PAGE__
const isStandalonePage = isSaladictPopupPage || isSaladictQuickSearchPage

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

  onDragAreaMouseDown: (e: React.MouseEvent<HTMLDivElement>) => any
  onDragAreaTouchStart: (e: React.TouchEvent<HTMLDivElement>) => any
}

export const MenuBar: FC<MenuBarProps> = props => {
  const { t } = useTranslate(['content', 'common'])
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
      />
      <SearchBtn t={t} onClick={() => props.searchText(props.text)} />
      <div
        className={`menuBar-DragArea${isStandalonePage ? '' : ' isActive'}`}
        onMouseDown={props.onDragAreaMouseDown}
        onTouchStart={props.onDragAreaTouchStart}
      />
      <ProfilesMemo
        t={t}
        profiles={props.profiles}
        activeProfileId={props.activeProfileId}
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
      <PinBtn t={t} isPinned={props.isPinned} onClick={props.togglePin} />
      <CloseBtn t={t} onClick={props.onClose} />
    </header>
  )
}
