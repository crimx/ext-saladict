import React, { FC, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { Layout } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getProfileName } from '@/_helpers/profile-manager'
import { useSelector } from '@/content/redux'
import { HeadInfoMemo } from './HeadInfo'

import './_style.scss'

export interface HeaderProps {
  openProfilesTab: (entry: 'Profiles') => void
}

export const Header: FC<HeaderProps> = props => {
  const { t, ready } = useTranslate(['options', 'common'])
  const { profileId, profileIDList } = useSelector(
    state => ({
      profileId: state.activeProfile.id,
      profileIDList: state.profiles
    }),
    shallowEqual
  )

  const version = useMemo(() => 'v' + browser.runtime.getManifest().version, [])

  const profileName = useMemo(
    () =>
      ready
        ? `「 ${getProfileName(
            profileIDList.find(({ id }) => id === profileId)?.name || '',
            t
          )} 」`
        : '',
    [profileId, profileIDList, ready]
  )

  return (
    <Layout.Header>
      <div className="options-header">
        <div className="options-header-title">
          <h1>{t('title')}</h1>
          <span>{version}</span>
        </div>
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
      </div>
    </Layout.Header>
  )
}

export const HeaderMemo = React.memo(Header)
