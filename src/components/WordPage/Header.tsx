import React, { FC } from 'react'
import { TFunction } from 'i18next'
import { Layout, Input, Dropdown, Menu, Button, Modal } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { DownOutlined } from '@ant-design/icons'
import { DBArea } from '@/_helpers/record-manager'

export interface WordPageProps {
  t: TFunction
  area: DBArea
  searchText: string
  totalCount: number
  selectedCount: number
  onSearchTextChanged: (text: string) => void
  onExport: MenuProps['onClick']
  onDelete: (key: string) => void
}

export const Header: FC<WordPageProps> = props => {
  const { t } = props

  return (
    <Layout.Header className="wordpage-Header">
      <div className="wordpage-Title">
        <h1 className="wordpage-Title_head">
          {t(`title.${props.area}`)}{' '}
          <small className="wordpage-Title_small">({t('localonly')})</small>
        </h1>
        <div style={{ whiteSpace: 'nowrap' }}>
          {props.totalCount > 0 && (
            <span className="wordpage-Wordcount">
              {t(`wordCount.total`, { count: props.totalCount })}
            </span>
          )}
          {props.selectedCount > 0 && (
            <span className="wordpage-Wordcount">
              {t(`wordCount.selected`, { count: props.selectedCount })}
            </span>
          )}
        </div>
      </div>
      <div className="wordpage-BtnGroup">
        <Input
          style={{ width: '15em' }}
          placeholder="Search"
          onChange={e => props.onSearchTextChanged(e.currentTarget.value)}
          value={props.searchText}
        />
        <Dropdown
          overlay={
            <Menu onClick={props.onExport}>
              {props.selectedCount > 0 && (
                <Menu.Item key="selected">{t('export.selected')}</Menu.Item>
              )}
              <Menu.Item key="page">{t('export.page')}</Menu.Item>
              <Menu.Item key="all">{t('export.all')}</Menu.Item>
            </Menu>
          }
        >
          <Button style={{ marginLeft: 8 }}>
            {t('export.title')} <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          overlay={
            <Menu
              onClick={({ key }) => {
                if (key) {
                  Modal.confirm({
                    title: t('delete'),
                    content: t(`delete.${key}`) + t('delete.confirm'),
                    okType: 'danger',
                    onOk: () => props.onDelete(`${key}`)
                  })
                }
              }}
            >
              {props.selectedCount > 0 && (
                <Menu.Item key="selected">{t('delete.selected')}</Menu.Item>
              )}
              <Menu.Item key="page">{t('delete.page')}</Menu.Item>
              <Menu.Item key="all">{t('delete.all')}</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" danger style={{ marginLeft: 8 }}>
            {t('delete.title')} <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </Layout.Header>
  )
}
