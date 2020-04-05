import React, { FC, useContext, useMemo } from 'react'
import { Layout } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getProfileName } from '@/_helpers/profile-manager'
import { ProfileContext, ProfileIDListContext } from '../Contexts'
import { HeadInfoMemo } from './HeadInfo'

import './_style.scss'

export const Header: FC = () => {
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
    [profile, profileIDList, ready]
  )

  return (
    <Layout.Header className="options-header">
      <h1 style={{ color: '#fff' }}>{t('title')}</h1>
      <span style={{ color: '#fff' }}>{profileName}</span>
      <HeadInfoMemo />
    </Layout.Header>
  )
}

export const HeaderMemo = React.memo(Header)
