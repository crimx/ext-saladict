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
import { debounceTime } from 'rxjs/operators'
import { hover, hoverWithDelay, focusBlur } from '@/_helpers/observables'
import {
  updateActiveProfileID,
  getProfileName
} from '@/_helpers/profile-manager'
import { isOptionsPage } from '@/_helpers/saladict'
import { FloatBox } from './FloatBox'
import { OptionsBtn } from './MenubarBtns'
import { message } from '@/_helpers/browser-api'

export interface ProfilesProps {
  t: TFunction
  profiles: Array<{ id: string; name: string }>
  activeProfileId: string
  onHeightChanged: (height: number) => void

  onProfileChanged: (id: string) => void
}

/**
 * Pick and choose profiles
 */
export const Profiles: FC<ProfilesProps> = props => {
  const [onMouseOverOutDelay, mouseOverOutDelay$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hoverWithDelay)

  const [onMouseOverOut, mouseOverOut$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hover)

  const [onFocusBlur, focusBlur$] = useObservableCallback(focusBlur)

  const [showHideProfiles, showHideProfiles$] = useObservableCallback<boolean>(
    identity
  )

  const isShowProfiles = useObservableState(
    useObservable(() =>
      merge(mouseOverOut$, mouseOverOutDelay$, focusBlur$, showHideProfiles$)
    ).pipe(debounceTime(100)),
    false
  )

  const listItem = props.profiles.map(p => {
    return {
      key: p.id,
      content: (
        <span
          className={`menuBar-ProfileItem${
            p.id === props.activeProfileId ? ' isActive' : ''
          }`}
        >
          {getProfileName(p.name, props.t)}
        </span>
      )
    }
  })

  return (
    <div className="menuBar-ProfileContainer">
      <OptionsBtn
        t={props.t}
        disabled={isOptionsPage()}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            e.stopPropagation()
            showHideProfiles(true)
          }
        }}
        onMouseOver={onMouseOverOutDelay}
        onMouseOut={onMouseOverOutDelay}
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
                onMouseOver={onMouseOverOut}
                onMouseOut={onMouseOverOut}
                onArrowUpFirst={container =>
                  (container.lastElementChild as HTMLButtonElement).focus()
                }
                onArrowDownLast={container =>
                  (container.firstElementChild as HTMLButtonElement).focus()
                }
                onSelect={id => {
                  updateActiveProfileID(id)
                  props.onProfileChanged(id)
                }}
                onHeightChanged={props.onHeightChanged}
              />
            </div>
          )}
        </CSSTransition>
      )}
    </div>
  )
}
