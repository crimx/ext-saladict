import React, { FC, useContext, useMemo } from 'react'
import { Layout } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getProfileName } from '@/_helpers/profile-manager'
import { ProfileContext, ProfileIDListContext } from '../Contexts'
import { HeadInfoMemo } from './HeadInfo'

import './_style.scss'

export interface HeaderProps {
  openProfilesTab: (entry: 'Profiles') => void
}

export const Header: FC<HeaderProps> = props => {
  const { t, ready } = useTranslate(['options', 'common'])
  const profile = useContext(ProfileContext)
  const profileIDList = useContext(ProfileIDListContext)

  const profileName = useMemo(
    () =>
      ready
        ? `「 ${getProfileName(
            profileIDList.find(({ id }) => id === profile.id)?.name || '',
            t
          )} 」`
        : '',
    [profile.id, profileIDList, ready]
  )

  return (
    <Layout.Header className="options-header">
      <h1>{t('title')}</h1>
      <a
        href="/?menuselected=Profiles"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          props.openProfilesTab('Profiles')
        }}
      >
        {profileName}
      </a>
      <HeadInfoMemo />
    </Layout.Header>
  )
}

export const HeaderMemo = React.memo(Header)
