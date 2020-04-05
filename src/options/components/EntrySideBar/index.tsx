import React, { FC } from 'react'
import { Layout, Menu, Affix } from 'antd'
import {
  SettingOutlined,
  TagsOutlined,
  DashboardOutlined,
  ProfileOutlined,
  SelectOutlined,
  BookOutlined,
  FilePdfOutlined,
  DatabaseOutlined,
  LayoutOutlined,
  FlagOutlined,
  ExceptionOutlined,
  SwapOutlined,
  LockOutlined
} from '@ant-design/icons'
import { useTranslate } from '@/_helpers/i18n'

import './_style.scss'

export interface EntrySideBarProps {
  entry: string
  onChange: (entry: string) => void
}

export const EntrySideBar: FC<EntrySideBarProps> = props => {
  const { t } = useTranslate('options')
  return (
    <Affix>
      <Layout>
        <Layout.Sider
          className="entry-sidebar"
          width={180}
          breakpoint="lg"
          collapsible
          trigger={null}
        >
          <Menu
            mode="inline"
            selectedKeys={[props.entry]}
            onSelect={({ key }) => props.onChange(key)}
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
            <Menu.Item key="PDF">
              <FilePdfOutlined />
              <span>{t('nav.PDF')}</span>
            </Menu.Item>
            <Menu.Item key="ContextMenus">
              <DatabaseOutlined />
              <span>{t('nav.ContextMenus')}</span>
            </Menu.Item>
            <Menu.Item key="Popup">
              <LayoutOutlined />
              <span>{t('nav.Popup')}</span>
            </Menu.Item>
            <Menu.Item key="QuickSearch">
              <FlagOutlined />
              <span>{t('nav.QuickSearch')}</span>
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
              <LockOutlined />
              <span>{t('nav.Privacy')}</span>
            </Menu.Item>
          </Menu>
        </Layout.Sider>
      </Layout>
    </Affix>
  )
}

export const EntrySideBarMemo = React.memo(EntrySideBar)
