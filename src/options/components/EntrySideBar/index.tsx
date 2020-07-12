import React, { FC, useState } from 'react'
import { Layout, Menu, Affix, Modal } from 'antd'
import {
  SettingOutlined,
  TagsOutlined,
  DashboardOutlined,
  ProfileOutlined,
  SelectOutlined,
  BookOutlined,
  SoundOutlined,
  FilePdfOutlined,
  DatabaseOutlined,
  LayoutOutlined,
  FlagOutlined,
  ExceptionOutlined,
  SwapOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined
} from '@ant-design/icons'
import { useObservableState } from 'observable-hooks'
import classnames from 'classnames'
import { debounceTime, scan, distinctUntilChanged } from 'rxjs/operators'
import { useTranslate } from '@/_helpers/i18n'
import { setFormDirty, useFormDirty } from '@/options/helpers/use-form-dirty'

import './_style.scss'

export interface EntrySideBarProps {
  entry: string
  onChange: (entry: string) => void
}

export const EntrySideBar: FC<EntrySideBarProps> = props => {
  const { t } = useTranslate('options')
  const formDirtyRef = useFormDirty()
  // trigger affix rerendering on collapse state changes to update width
  const [affixKey, onCollapse] = useObservableState<number, boolean>(event$ =>
    event$.pipe(
      distinctUntilChanged(), // onCollapse will be triggered on initial collapsed state
      debounceTime(500), // wait for transition
      scan(id => (id + 1) % 10000, 0) // unique id
    )
  )
  const [affixed, setAffixed] = useState<boolean>()

  return (
    <Affix key={affixKey} onChange={setAffixed}>
      <Layout>
        <Layout.Sider
          className={classnames('entry-sidebar', 'fancy-scrollbar', {
            isAffixed: affixed
          })}
          width={180}
          breakpoint="lg"
          collapsible
          trigger={null}
          onCollapse={onCollapse}
        >
          <Menu
            mode="inline"
            selectedKeys={[props.entry]}
            onSelect={({ key }) => {
              const switchTab = () => {
                props.onChange(`${key}`)
                setFormDirty(false)
              }
              if (formDirtyRef.value) {
                Modal.confirm({
                  title: t('unsave_confirm'),
                  icon: <ExclamationCircleOutlined />,
                  okType: 'danger',
                  onOk: switchTab
                })
              } else {
                switchTab()
              }
            }}
          >
            <Menu.Item key="General">
              <SettingOutlined />
              <span>{t('nav.General')}</span>
            </Menu.Item>
            <Menu.Item key="Notebook">
              <TagsOutlined />
              <span>{t('nav.Notebook')}</span>
            </Menu.Item>
            <Menu.Item key="Profiles">
              <DashboardOutlined />
              <span>{t('nav.Profiles')}</span>
            </Menu.Item>
            <Menu.Item key="DictPanel">
              <ProfileOutlined />
              <span>{t('nav.DictPanel')}</span>
            </Menu.Item>
            <Menu.Item key="SearchModes">
              <SelectOutlined />
              <span>{t('nav.SearchModes')}</span>
            </Menu.Item>
            <Menu.Item key="Dictionaries">
              <BookOutlined />
              <span>{t('nav.Dictionaries')}</span>
            </Menu.Item>
            <Menu.Item key="DictAuths">
              <KeyOutlined />
              <span>{t('nav.DictAuths')}</span>
            </Menu.Item>
            <Menu.Item key="Popup">
              <LayoutOutlined />
              <span>{t('nav.Popup')}</span>
            </Menu.Item>
            <Menu.Item key="QuickSearch">
              <FlagOutlined />
              <span>{t('nav.QuickSearch')}</span>
            </Menu.Item>
            <Menu.Item key="Pronunciation">
              <SoundOutlined />
              <span>{t('nav.Pronunciation')}</span>
            </Menu.Item>
            <Menu.Item key="PDF">
              <FilePdfOutlined />
              <span>{t('nav.PDF')}</span>
            </Menu.Item>
            <Menu.Item key="ContextMenus">
              <DatabaseOutlined />
              <span>{t('nav.ContextMenus')}</span>
            </Menu.Item>
            <Menu.Item key="BlackWhiteList">
              <ExceptionOutlined />
              <span>{t('nav.BlackWhiteList')}</span>
            </Menu.Item>
            <Menu.Item key="ImportExport">
              <SwapOutlined />
              <span>{t('nav.ImportExport')}</span>
            </Menu.Item>
            <Menu.Item key="Privacy">
              <SafetyCertificateOutlined />
              <span>{t('nav.Privacy')}</span>
            </Menu.Item>
            <Menu.Item key="Permissions">
              <LockOutlined />
              <span>{t('nav.Permissions')}</span>
            </Menu.Item>
          </Menu>
        </Layout.Sider>
      </Layout>
    </Affix>
  )
}

export const EntrySideBarMemo = React.memo(EntrySideBar)
