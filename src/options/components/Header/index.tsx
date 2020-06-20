import React, { FC, useMemo } from 'react'
import { Layout } from 'antd'
import { useObservableState, useObservableGetState } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import { getProfileName } from '@/_helpers/profile-manager'
import { profile$$, profileIDList$$ } from '@/options/data'
import { HeadInfoMemo } from './HeadInfo'

import './_style.scss'

export interface HeaderProps {
  openProfilesTab: (entry: 'Profiles') => void
}

export const Header: FC<HeaderProps> = props => {
  const { t, ready } = useTranslate(['options', 'common'])
  const profileId = useObservableGetState(profile$$, '', 'id')
  const profileIDList = useObservableState(profileIDList$$, [])

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
