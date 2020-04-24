import React, { FC } from 'react'
import { TFunction } from 'i18next'
import CSSTransition from 'react-transition-group/CSSTransition'
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  identity
} from 'observable-hooks'
import { merge } from 'rxjs'
import { hover, hoverWithDelay, focusBlur } from '@/_helpers/observables'
import { getProfileName } from '@/_helpers/profile-manager'
import { isOptionsPage } from '@/_helpers/saladict'
import { FloatBox } from './FloatBox'
import { OptionsBtn } from './MenubarBtns'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'

export interface ProfilesProps {
  t: TFunction
  profiles: Array<{ id: string; name: string }>
  activeProfileId: string
  onSelectProfile: (id: string) => void
  onHeightChanged: (height: number) => void
}

/**
 * Pick and choose profiles
 */
export const Profiles: FC<ProfilesProps> = props => {
  const { t } = useTranslate(['content', 'common'])
  const [onHoverBtn, onHoverBtn$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hoverWithDelay)

  const [onHoverBox, onHoverBox$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hover)

  const [onFocusBlur, focusBlur$] = useObservableCallback(focusBlur)

  const [showHideProfiles, showHideProfiles$] = useObservableCallback<boolean>(
    identity
  )

  const isOnBtn = useObservableState(onHoverBtn$, false)

  const isOnBox = useObservableState(
    useObservable(() => merge(onHoverBox$, focusBlur$, showHideProfiles$)),
    false
  )

  const isShowProfiles = isOnBtn || isOnBox

  const listItem = props.profiles.map(p => {
    return {
      key: p.id,
      content: (
        <span
          className={`menuBar-ProfileItem${
            p.id === props.activeProfileId ? ' isActive' : ''
          }`}
        >
          {getProfileName(p.name, t)}
        </span>
      )
    }
  })

  return (
    <div className="menuBar-ProfileContainer">
      <OptionsBtn
        t={t}
        disabled={isOptionsPage()}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            e.stopPropagation()
            showHideProfiles(true)
          }
        }}
        onMouseOver={onHoverBtn}
        onMouseOut={onHoverBtn}
        onClick={() =>
          message.send({
            type: 'OPEN_URL',
            payload: { url: 'options.html', self: true }
          })
        }
      />
      {!isOptionsPage() && (
        <CSSTransition
          classNames="menuBar-Profiles"
          in={isShowProfiles}
          timeout={100}
          mountOnEnter={true}
          unmountOnExit={true}
          onExited={() => props.onHeightChanged(0)}
        >
          {() => (
            <div className="menuBar-ProfileBox">
              <FloatBox
                list={listItem}
                onFocus={onFocusBlur}
                onBlur={onFocusBlur}
                onMouseOver={onHoverBox}
                onMouseOut={onHoverBox}
                onArrowUpFirst={container =>
                  (container.lastElementChild as HTMLButtonElement).focus()
                }
                onArrowDownLast={container =>
                  (container.firstElementChild as HTMLButtonElement).focus()
                }
                onSelect={props.onSelectProfile}
                onHeightChanged={props.onHeightChanged}
              />
            </div>
          )}
        </CSSTransition>
      )}
    </div>
  )
}
