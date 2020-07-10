import React, { FC } from 'react'
import { TFunction } from 'i18next'
import { getProfileName } from '@/_helpers/profile-manager'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'
import { isOptionsPage } from '@/_helpers/saladict'
import { HoverBox, HoverBoxItem } from '@/components/HoverBox'
import { OptionsBtn } from './MenubarBtns'

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
  const { t } = useTranslate(['common'])

  const listItems: HoverBoxItem[] = props.profiles.map(p => {
    return {
      key: p.id,
      value: p.id,
      label: (
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
    <HoverBox
      Button={ProfilesBtn}
      items={listItems}
      onBtnClick={() => {
        message.send({
          type: 'OPEN_URL',
          payload: { url: 'options.html', self: true }
        })
        return false
      }}
      onSelect={props.onSelectProfile}
      onHeightChanged={props.onHeightChanged}
    />
  )
}

function ProfilesBtn(props: React.ComponentProps<'button'>) {
  const { t } = useTranslate(['content'])
  return <OptionsBtn {...props} t={t} disabled={isOptionsPage()} />
}
