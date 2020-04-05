import React, { FC, useState, useEffect, createContext } from 'react'
import { message as antMsg } from 'antd'
import { getDefaultProfile, ProfileIDList } from '@/app-config/profiles'
import { getDefaultConfig } from '@/app-config'
import { createConfigStream } from '@/_helpers/config-manager'
import { useTranslate } from '@/_helpers/i18n'
import {
  createActiveProfileStream,
  createProfileIDListStream
} from '@/_helpers/profile-manager'
import {
  useObservable,
  useObservableState,
  useSubscription
} from 'observable-hooks'
import { share, skip } from 'rxjs/operators'

const defaultConfig = getDefaultConfig()
const defaultProfile = getDefaultProfile()
const defaultProfileIDList: ProfileIDList = []

export const ConfigContext = createContext(defaultConfig)
export const ProfileContext = createContext(defaultProfile)
export const ProfileIDListContext = createContext(defaultProfileIDList)

export const Contexts: FC = ({ children }) => {
  const { t } = useTranslate('options')

  const msgUpdated = () => {
    antMsg.destroy()
    antMsg.success(t('msg_updated'))
  }

  const config$$ = useObservable(() => createConfigStream().pipe(share()))
  const config = useObservableState(config$$, defaultConfig)
  useSubscription(
    useObservable(() => config$$.pipe(skip(1))),
    msgUpdated
  )

  const profile$$ = useObservable(() =>
    createActiveProfileStream().pipe(share())
  )
  const profile = useObservableState(profile$$, defaultProfile)
  useSubscription(
    useObservable(() => profile$$.pipe(skip(1))),
    msgUpdated
  )

  const profileIDList$$ = useObservable(() =>
    createProfileIDListStream().pipe(share())
  )
  const profileIDList = useObservableState(
    profileIDList$$,
    defaultProfileIDList
  )
  useSubscription(
    useObservable(() => profileIDList$$.pipe(skip(1))),
    msgUpdated
  )

  return (
    <ConfigContext.Provider value={config}>
      <ProfileContext.Provider value={profile}>
        <ProfileIDListContext.Provider value={profileIDList}>
          {children}
        </ProfileIDListContext.Provider>
      </ProfileContext.Provider>
    </ConfigContext.Provider>
  )
}
